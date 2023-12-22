import { useState } from 'react';
import { 
  Grid, 
  Container, 
  Typography, 
  Box, 
  Stack,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// declare server port and host for requests
const SERVER_PROTOCOL = import.meta.env.VITE_SERVER_PROTOCOL;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
const FLASK_PORT = import.meta.env.VITE_FLASK_PORT;

export default function BettingPage() {

  const [results, setResults] = useState({
    NumMatches: 0,
    NumCorrect: 0,
    AmountBet: 0.0,
    AmountWon: 0.0,
    ROI: 0.0
  }); // variable for results of betting strategy
  const [bettingAmount, setBettingAmount] = useState(1.0);
  const [startDate, setStartDate] = useState(dayjs('2015-01-01'));
  const [endDate, setEndDate] = useState(dayjs('2015-02-01'));
  const [useAce, setUseAce] = useState(true);
  const [useDf, setUseDf] = useState(false);
  const [useSvpt, setUseSvpt] = useState(false);
  const [use1stIn, setUse1stIn] = useState(false);
  const [use1stWon, setUse1stWon] = useState(false);
  const [use2ndWon, setUse2ndWon] = useState(false);
  const [useSvGms, setUseSvGms] = useState(false);
  const [useBpSaved, setUseBpSaved] = useState(false);
  const [useBpFaced, setUseBpFaced] = useState(false);

  const [simulating, setSimulating] = useState(false);
  const [open, setOpen] = useState(false);
  const [matchResults, setMatchResults] = useState({});
  const sec_per_query = 0.03;

  const handleSimulateClick = async () => {
    potentiallySimulateBettingWithModel();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseAndRun = () => {
    setOpen(false);
    setSimulating(true);
    simulateBettingWithModel();
  };

  const simulateBettingWithFavorites = () => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/betting/favorite?` + 
      `amount=${bettingAmount}&` + 
      `start_date=${startDate.format('YYYY-MM-DD')}&` + 
      `end_date=${endDate.format('YYYY-MM-DD')}`
    )
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setResults(resJson)) // set results of the strategy
    .catch((err) => console.log(err)); // catch and log errors
  };

  // function handles change of page number
  const simulateBettingWithStatistics = () => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/betting/statistics?` + 
      `amount=${bettingAmount}&` + 
      `start_date=${startDate.format('YYYY-MM-DD')}&` + 
      `end_date=${endDate.format('YYYY-MM-DD')}&` +
      `use_avg_ace=${useAce}&` +
      `use_avg_df=${useDf}&` +
      `use_avg_svpt=${useSvpt}&` +
      `use_avg_1stIn=${use1stIn}&` +
      `use_avg_1stWon=${use1stWon}&` +
      `use_avg_2ndWon=${use2ndWon}&` +
      `use_avg_SvGms=${useSvGms}&` +
      `use_avg_bpSaved=${useBpSaved}&` +
      `use_avg_bpFaced=${useBpFaced}`
    ) // send get request to analyze betting strategy on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setResults(resJson)) // set results of the strategy
    .catch((err) => console.log(err)); // catch and log errors
  };

  const potentiallySimulateBettingWithModel = async () => {
    // get all the matches within the date range
    fetch(
      `${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/match/results?` + 
      `start_date=${startDate.format('YYYY-MM-DD')}&` + 
      `end_date=${endDate.format('YYYY-MM-DD')}`
    )
    .then((res) => res.json())
    .then((resJson) => setMatchResults(resJson));
  };

  const simulateBettingWithModel = async () => {
    // deploy the model over each match
    const matchups = await matchResults.map(async match => {
      // get the data from both players, Promise.all ensures we have both before continuing
      const playerData = await fetch(
        `${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/betting/ml/` + 
        `${match.winner_id}/${match.loser_id}/${match.year}`
      )
      .then(res => res.json())
      .then(resJson => Object.values(resJson));
      
      return playerData;
    });

    Promise.all(matchups)
    .then((matchup_arr) => {
      if (matchup_arr.length !== 0) {
        fetch(
          `http://${SERVER_HOST}:${FLASK_PORT}/betting/`,
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(matchup_arr)
          }
        )
        .then(res => res.json())
        .then(resJson => {
          const numMatches = resJson.length; // number of matches is equal to length of correct
          const numCorrect = resJson.reduce((a1, a2) => a1 + a2, 0); // sum correct array (resJson)
          const amountBet = bettingAmount * numMatches; // set bet amount
          
          // compute total winnings
          const amountWon = matchResults
            .map(result => result.AvgW)
            .reduce((a1,a2,idx) => a1 + a2 * resJson[idx], 0); 

          // compute ROI
          const ROI = (amountWon - amountBet) / amountBet; 

          setResults({
            NumMatches: numMatches,
            NumCorrect: numCorrect,
            AmountBet: amountBet,
            AmountWon: amountWon,
            ROI: ROI
          });
        });
      } else {
        setResults({
          NumMatches: 0,
          NumCorrect: 0,
          AmountBet: 0,
          AmountWon: 0,
          ROI: 0
        });
      }

      setSimulating(false);
    })
    .catch(err => (console.log(err)));
  };

  return (
    <Container maxWidth='xl'>
      <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Run simulation?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This simulation may take a long time. There are {matchResults.length} matches in the date range you selected. This simulation is estimated to take {(matchResults.length*sec_per_query/60).toFixed(1)} minutes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCloseAndRun}>Run</Button>
        </DialogActions>
      </Dialog>

      <Grid container direction={'row'} spacing={3} justifyContent={'space-around'} sx={{marginTop: 0}}>
        <Grid item xs={12}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            Betting Strategies
          </Typography>
        </Grid>
        
        <Grid item xs={4} textAlign={'center'}>
          <Stack spacing={4}>
            <Box>
              <Typography variant='h6' textAlign={'start'} pb={2}>
                <strong>Select betting strategy parameters:</strong>
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Bet per match"
                  id="outlined-start-adornment"
                  size='small'
                  color='success'
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={bettingAmount}
                  onChange={(event) => {
                    setBettingAmount(event.target.value);
                  }}
                  sx={{width: '60%'}}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker 
                    minDate={dayjs('1878-01-01', 'YYYY-MM-DD')}
                    maxDate={dayjs('2023-01-01', 'YYYY-MM-DD')} 
                    value={startDate} 
                    onChange={(newValue) => setStartDate(newValue)}
                    label="Start Date"
                    slotProps={{ textField: { size: 'small', color: 'success' } }}
                    backgroundColor="red"
                    sx={{width: '60%'}}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    minDate={dayjs('1878-01-01', 'YYYY-MM-DD')}
                    maxDate={dayjs('2023-01-01', 'YYYY-MM-DD')} 
                    value={endDate} 
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { size: 'small', color: 'success' } }}
                    label="End Date"
                    backgroundColor="red"
                    sx={{width: '60%'}}
                  />
                </LocalizationProvider>
              </Stack>
            </Box>
            <Box>
              <Typography variant='h6' textAlign={'start'} pb={1}>
                <strong>Select statistics for betting strategy:</strong>
              </Typography>
              <Stack direction={'row'} spacing={1}>
                <Stack>
                  <FormControlLabel
                    value='left'
                    control={<Switch
                      defaultChecked
                      color="success" 
                      onChange={(event) => {setUseAce(event.target.checked)}}
                      />}
                    label="Aces"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUseDf(event.target.checked)}}
                      />}
                    label="Double faults"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUseSvpt(event.target.checked)}}
                      />}
                    label="Serve points"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUseSvGms(event.target.checked)}}
                      />}
                    label="Serve games"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUse1stIn(event.target.checked)}}
                      />}
                    label="1st serves made"
                  />
                </Stack>
                <Stack spacing={1}>
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUseBpFaced(event.target.checked)}}
                      />}
                    label="Break-points faced"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUseBpSaved(event.target.checked)}}
                      />}
                    label="Break-points saved"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUse1stWon(event.target.checked)}}
                      />}
                    label="1st-serve points won"
                  />
                  <FormControlLabel
                    value="left"
                    control={<Switch 
                      color="success" 
                      onChange={(event) => {setUse2ndWon(event.target.checked)}}
                      />}
                    label="2nd-serve points won"
                  />
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid item>
            <Divider orientation='vertical' variant='middle' sx={{height:400}}></Divider>
        </Grid>

        <Grid item xs={7}>
          <Typography variant='h6' textAlign={'start'} pb={2}>
            <strong>Choose betting strategy:</strong>
          </Typography>
          <Stack spacing={4}>
            <Stack direction={'row'} spacing={2} justifyContent={'space-around'}>
              <Button 
                disabled={startDate >= endDate || simulating}
                color='success'
                variant="contained" 
                onClick={() => {simulateBettingWithFavorites()}}
                sx={{width: '35%'}}
              >
                Simulate with Favorite
              </Button>
              <Button 
                disabled={startDate >= endDate || simulating}
                color='success'
                variant="contained" 
                onClick={() => {simulateBettingWithStatistics()}}
                sx={{width: '35%'}}
              >
                Simulate with Stats
              </Button>
              {/* <LoadingButton 
                disabled={startDate >= endDate}
                color='success'
                variant="contained" 
                onClick={() => {handleSimulateClick();}}
                loading={simulating}
                loadingIndicator={<CircularProgress color={'success'} variant='indeterminate'/>}
              >
                Simulate with <br/>Predictive Model
              </LoadingButton> */}
            </Stack>
            <Stack spacing={1}>
              <Typography variant='h6' textAlign={'start'}>
                <strong>Betting results:</strong>
              </Typography>
              <Stack direction={'row'} justifyContent={'space-around'}>
                <Box>
                  <Typography variant='h6'>
                    Total Matches Bet On: {results.NumMatches}
                  </Typography>
                  <Typography variant='h6'>
                    Correctly Bets: {results.NumCorrect}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='h6'>
                    Amount Bet: ${results.AmountBet.toFixed(2)}
                  </Typography>
                  <Typography variant='h6'>
                    Amount Won: ${results.AmountWon.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='h6'>
                    ROI: {results.ROI ? (100*results.ROI).toFixed(2) : 0}%
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Grid>             
      </Grid>
    </Container>
  );
}