import { useState } from 'react';
import { 
  Grid, 
  Container, 
  Typography, 
  Box, 
  Stack,
  Divider,
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgressWithLabel from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
const FLASK_PORT = import.meta.env.VITE_FLASK_PORT;

// TODO: better error handling
// TODO: better input type checking
// TODO: move query to params (i.e. most of these inputs are required not optional)
// TODO: move amount/date range to left column, favorites+results to next column, statistics toggles+results to next, ML+results to next column
// TODO: changing betting amount to only this page not queries
// TODO: add spinning wheel (our progress bar) for ML
// TODO: add cancel button for ML
// TODO: add warning+time estimation for ML
// TODO: fix date picker color in dark mode
// TODO: optimize stats query time (i.e. get yearly stats+accumulate stats+simultate -> query player stats view+accumulate+simulate)
// TODO: optimize query via indexing on winner_id and loser_id (GET BEFORE AND AFTER)
// TODO: retrain model to inlude probality as output and remove SvGms from the model 18->16 features per match (PCA too?) (non-SVM?)
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
  const [useAce, setUseAce] = useState(false);
  const [useDf, setUseDf] = useState(false);
  const [useSvpt, setUseSvpt] = useState(false);
  const [use1stIn, setUse1stIn] = useState(false);
  const [use1stWon, setUse1stWon] = useState(false);
  const [use2ndWon, setUse2ndWon] = useState(false);
  const [useSvGms, setUseSvGms] = useState(false);
  const [useBpSaved, setUseBpSaved] = useState(false);
  const [useBpFaced, setUseBpFaced] = useState(false);

  var progress = 0;
  const [simulating, setSimulating] = useState(false);
  const [open, setOpen] = useState(false);
  const [matchResultsJson, setMatchResults] = useState({});
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
    simulateBettingWithModel();
    setSimulating(true);
  };

  const simulateBettingWithFavorites = () => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/betting/favorite?` + 
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
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/betting/statistics?` + 
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
    const matchResults = await fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/match/results?` + 
      `start_date=${startDate.format('YYYY-MM-DD')}&` + 
      `end_date=${endDate.format('YYYY-MM-DD')}`
    );
    console.log(matchResults);
    setMatchResults(await matchResults.json());
  };

  const simulateBettingWithModel = async () => {

    progress = 0.0;

    // deploy the model over each match
    const simulationResultsData = await matchResultsJson.map(async match => {

      // get the data from both players, Promise.all ensures we have both before continuing
      const playerDataJson = (await Promise.all([
        fetch(
          `http://${SERVER_HOST}:${SERVER_PORT}/api/player/${match.winner_id}/${match.year}`
        ),
        fetch(
          `http://${SERVER_HOST}:${SERVER_PORT}/api/player/${match.loser_id}/${match.year}`
        ),
      ])).map(data => (data.json()))
      const p1 = await playerDataJson[0];
      const p2 = await playerDataJson[1];


      // HOTFIX: for some reason this feature is spitting out null, so set to 0 for now
      // TODO: fix model to not include this feature?
      p1.avg_SvGms = 0;
      p2.avg_SvGms = 0;

      // call the flask api to get the model prediction for these 2 players
      const matchPrediction = await fetch(
        `http://${SERVER_HOST}:${FLASK_PORT}/predict/` +
        `${p1.avg_ace},` +
        `${p1.avg_df},` +
        `${p1.avg_svpt},` +
        `${p1.avg_1stIn},` +
        `${p1.avg_1stWon},` +
        `${p1.avg_2ndWon},` +
        `${p1.avg_SvGms},` +
        `${p1.avg_bpSaved},` + 
        `${p1.avg_bpFaced},` +
        `${p2.avg_ace},` +
        `${p2.avg_df},` +
        `${p2.avg_svpt},` +
        `${p2.avg_1stIn},` +
        `${p2.avg_1stWon},` +
        `${p2.avg_2ndWon},` +
        `${p2.avg_SvGms},` +
        `${p2.avg_bpSaved},` +
        `${p2.avg_bpFaced}`
      );
      const matchPredictionJson = await matchPrediction.json();

      progress += 1/matchResultsJson.length;
      console.log(progress);

      // TODO: retrain model to also include probality not just prediction
      return {
        "correct": matchPredictionJson.prediction == 0,
        "avgW": match.AvgW // including AvgW to calculate payout based on correct prediction
      }
    });

    // waiting until all matches are simultated
    const simulationResults = await Promise.all(simulationResultsData);

    // analyze the results
    var numMatches = 0;
    var numCorrect = 0;
    var amountWon = 0;
    for (const i in simulationResults) {

      // only count non-null predictions
      if (!(typeof simulationResults[i].correct === "undefined")) {
        numMatches += 1;
        if (simulationResults[i].correct) {
          numCorrect += 1;
          amountWon += bettingAmount * simulationResults[i].avgW;
        }
      }
    }
    const amountBet = bettingAmount * numMatches;
    const ROI = amountWon / amountBet;

    setResults({
      NumMatches: numMatches,
      NumCorrect: numCorrect,
      AmountBet: amountBet,
      AmountWon: amountWon,
      ROI: ROI
    });

    setSimulating(false);
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
            This simulation may take a long time. There are {matchResultsJson.length} matches in the date range you selected. This simulation is estimated to take {(matchResultsJson.length*sec_per_query/60).toFixed(1)} minutes.
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
            Betting Strategy Analysis
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
                    value="top"
                    control={<Switch 
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
                color='success'
                variant="contained" 
                onClick={() => {simulateBettingWithFavorites();}}
              >
                Simulate with Favorite
              </Button>
              <Button 
                color='success'
                variant="contained" 
                onClick={() => {simulateBettingWithStatistics();}}
              >
                Simulate with Stats
              </Button>
              <LoadingButton 
                color='success'
                variant="contained" 
                onClick={() => {handleSimulateClick();}}
                loading={simulating}
                loadingIndicator={<CircularProgressWithLabel value={progress} />}
              >
                Simulate with <br/>Predictive Model
              </LoadingButton>
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
                    Correctly Predicted: {results.NumCorrect}
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
                    ROI: {(100*results.ROI).toFixed(2)}%
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