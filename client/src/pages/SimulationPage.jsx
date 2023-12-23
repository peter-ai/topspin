import { 
  Container, 
  Grid, 
  Stack, 
  Typography, 
  FormControl, 
  Select, 
  InputLabel, 
  MenuItem, 
  TextField, 
  Autocomplete, 
  createFilterOptions, 
  Divider, 
  Box, 
  Button,
} from "@mui/material";
import Fade from '@mui/material/Fade';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ClearIcon from '@mui/icons-material/Clear';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { useEffect, useState, useRef } from "react";
import dayjs from 'dayjs';

// declare server port and host for requests
const SERVER_PROTOCOL = import.meta.env.VITE_SERVER_PROTOCOL;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
const FLASK_PORT = import.meta.env.VITE_FLASK_PORT;


export default function SimulationPage() {
  const OPTIONS_LIMIT = 750; // number of players to show in autocomplete list

  // query filters
  const [league, setLeague] = useState('both'); // league filter
  const [year, setYear] = useState(2023); // year of match filter
  const [playerList, setPlayerList] = useState([]); // players that match filters

  // tournament simulation params
  const [simulating, setSimulating] = useState(false);
  const [validInput, setValidInput] = useState(false);
  const [error, setError] = useState(false);
  const [errorLoc, setErrorLoc] = useState([]);
  
  const [tournament, setTournament] = useState([null, null, null, null, null, null, null, null]);
  const [players, setPlayers] = useState([null, null, null, null, null, null, null, null]);

  // players in semi-final matches
  const [sf1, setSF1] = useState();
  const [sf2, setSF2] = useState();
  const [sf3, setSF3] = useState();
  const [sf4, setSF4] = useState();

  // players in final match
  const [f1, setF1] = useState();
  const [f2, setF2] = useState();
  const [winner, setWinner] = useState();

  // retrieves new list of players whenever the league filter is toggled
  useEffect(() => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${year}/${league}`)
      .then((res) => res.json())
      .then((resJson) => setPlayerList(resJson))
      .catch((err) => console.log(err));
  }, [league]);

  // retrives new list of players whenever the year of competition is changed
  useEffect(() => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${year}/${league}`)
      .then((res) => res.json())
      .then((resJson) => {
        setPlayerList(resJson); // update with new player list
      })
      .catch((err) => console.log(err));
  }, [year]);

  // function that clears the stages of the simulation displayed
  // but leaves the selected players in place in case the user would prefer
  // not to reconstruct the bracket from scratch but rather use previous players
  const clearSimulation = (e, tournament=true) => {
    // reset all tournament stages
    setWinner();
    setF1();
    setF2();
    setSF1();
    setSF2();
    setSF3();
    setSF4();

    // reset state of simulation and error messaging
    setSimulating(false);
    setValidInput(tournament);
    setError(false);
    setErrorLoc([]);
  }

  // function that handles running the simulation through a stagewise approach
  // each round: 
  // - sends a sequence of queries to the Node server for the feature vector representing the match
  // - formats feature vector and sends to Flask server for processing and prediction using ML model
  // - updates state variables based on winners and losers of matches, displaying results
  // - triggers winner display once simulation is over
  const runSimulation = async () => {
    const delay = 1500; // create delay between simulation of rounds to make staged progession more natural

    // construct R1 matchups
    const matchup1 = tournament.slice(0,2);
    const matchup2 = tournament.slice(2,4);
    const matchup3 = tournament.slice(4,6);
    const matchup4 = tournament.slice(6);

    // query node server for stats vector and then query flask server for prediction
    const match1 = new Promise(resolve => setTimeout(resolve, delay)) 
      .then(() =>
        fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${matchup1[0]}/${matchup1[1]}/${year}`)
          .then((res) => res.json())
          .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
          .then((stat_vector) => fetch(`http://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
          .then((res) => res.json())
      );
    const match2 = new Promise(resolve => setTimeout(resolve, delay)) 
      .then(() =>
        fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${matchup2[0]}/${matchup2[1]}/${year}`)
          .then((res) => res.json())
          .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
          .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
          .then((res) => res.json())
      );
    const match3 = new Promise(resolve => setTimeout(resolve, delay)) 
      .then(() =>
        fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${matchup3[0]}/${matchup3[1]}/${year}`)
          .then((res) => res.json())
          .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
          .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
          .then((res) => res.json())
      );
    const match4 = new Promise(resolve => setTimeout(resolve, delay)) 
      .then(() =>
        fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${matchup4[0]}/${matchup4[1]}/${year}`)
          .then((res) => res.json())
          .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
          .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
          .then((res) => res.json())
      );

    // proceed once all promises have been fulfilled
    Promise.all([match1, match2, match3, match4])
      .then(([result1, result2, result3, result4]) => {          
        // retrive names of semifinalists to update bracket
        const semifinalists = [players.slice(0,2)[result1.prediction]]
          .concat(
            [players.slice(2,4)[result2.prediction]],
            [players.slice(4,6)[result3.prediction]],
            [players.slice(6)[result4.prediction]],
          );

        // construct semifinal matchups
        const semimatchup1 = [matchup1[result1.prediction], matchup2[result2.prediction]];
        const semimatchup2 = [matchup3[result3.prediction], matchup4[result4.prediction]];

        // set semifinalists
        setSF1(semifinalists[0]);
        setSF2(semifinalists[1]);
        setSF3(semifinalists[2]);
        setSF4(semifinalists[3]);
        
        const semimatch1 = new Promise(resolve => setTimeout(resolve, delay)) 
          .then(() =>
            fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${semimatchup1[0]}/${semimatchup1[1]}/${year}`)
              .then((res) => res.json())
              .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
              .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
              .then((res) => res.json())
          );
        const semimatch2 = new Promise(resolve => setTimeout(resolve, delay)) 
          .then(() =>
            fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${semimatchup2[0]}/${semimatchup2[1]}/${year}`)
              .then((res) => res.json())
              .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
              .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
              .then((res) => res.json())
          );

        // proceed once all promises are fulfilled  
        Promise.all([semimatch1, semimatch2])
          .then(([semi1result, semi2result])=> {
            // retrieve names of players in final
            const finalists = [semifinalists.slice(0,2)[semi1result.prediction]]
              .concat([semifinalists.slice(2)[semi2result.prediction]]);
            
            // construct tournament final
            const final = [semimatchup1[semi1result.prediction], semimatchup2[semi2result.prediction]];
            
            // set finalists
            setF1(finalists[0]);
            setF2(finalists[1]);

            // run final
            new Promise(resolve => setTimeout(resolve, delay)) 
              .then(() =>
                fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/${final[0]}/${final[1]}/${year}`)
                  .then((res) => res.json())
                  .then((resJson) => Object.values(resJson).map((val => val ? val : 'None')).join(','))
                  .then((stat_vector) => fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${FLASK_PORT}` : ``) + `/ml/predict/${stat_vector}`))
                  .then((res) => res.json())
                  .then((resJson) => {
                    setWinner(finalists[resJson.prediction]);
                    setSimulating(false);
                  })
              );
          })
          .catch((err) => console.log(err));  
    })
    .catch((err) => console.log(err));
  }

  // function that shows the results of the simulation or an error message if
  // the input players were not valid selections
  const showResults = () => {
    if (error) {
      return (
        <Box 
          textAlign={'center'}
        >
          <WarningAmberIcon color='warning' />
          <Fade in timeout={3000}>
            <Typography
              color={'warning.light'}
              align='center'
              variant='h6'
            >
              The same athlete has been selected more than once, 
              please update Player{errorLoc.length > 1 ? 's' : ''} 
              {' ' +
              ( errorLoc.length===1 
                ? errorLoc[0] 
                : (errorLoc.length===2 ? errorLoc.join(' and ') : errorLoc.slice(0, -1).join(', ') + ', and ' + errorLoc[errorLoc.length-1]) )
              +' '} 
              to continue.
            </Typography>
          </Fade>
        </Box>
      );
    } 
    if (winner) {
      return (
        <Box
          textAlign={'center'}
        >
          <EmojiEventsIcon fontSize='large' sx={{color:'#FFD700'}}/>
          <Fade in timeout={3000}>
            <Typography
              color={'success.main'}
              align='center'
              variant='h6'
            >
              <strong>{winner}</strong> has won the {year} TopSpin Cup!
            </Typography>
          </Fade>
        </Box>
      );
    }
    return '';
  }

  // function that processes the selection of players and validates they are unique
  // triggers show result if validation is not passed via setError(true)
  const processPlayerSelection = ({e=null, id=null, value, reason=null}) => {
    var seed;

    if (id) {
      seed = parseInt(id.split('-')[1]) - 1; // get the specific selector number

      var tournament_copy = [
        ...tournament.slice(0,seed), 
        (reason === 'selectOption' ? value.id : null), 
        ...tournament.slice(seed+1)
      ];
      var players_copy = [
        ...players.slice(0,seed), 
        (reason === 'selectOption' ? value.label : null), 
        ...players.slice(seed+1)
      ];

      setTournament(tournament_copy);
      setPlayers(players_copy);
      
    }

    if (!tournament_copy.some(element => element === null) && new Set(tournament_copy).size === 8) {
      // if array contains no null values and no duplicate values, valid input, allow simulation
      setErrorLoc([]);
      setError(false);
      setValidInput(true);
    } else if (!tournament_copy.some(element => element === null) && new Set(tournament_copy).size < 8) {
      // if array has no null values but contains duplicates show warning, disallow simulation
      const duplicates = [];
      for (let i = 0; i < tournament_copy.length; i++) {
        if (tournament_copy.indexOf(tournament_copy[i]) !== i) {
            duplicates.push(i+1);
        }
      }
      setErrorLoc(duplicates);
      setError(true);
      setValidInput(false);
    } else {
      // if nulls, disallow simulation
      setErrorLoc([]);
      setError(false);
      setValidInput(false);
    }
  }

  // function handles change of league dropdown
  const handleLeagueFilter = (e) => {
    e.preventDefault();
    setLeague(e.target.value); // set variable to current value of league selected
  };

  // function handles the change of the year
  const handleYearFilter = (value) => {
    setTournament(Array(8).fill(null)); // resets the player ids in tournament array
    setPlayers(Array(8).fill(null)); // resets player names in players array
    clearSimulation('', false); // clear all errors, tournament slots, winners
    setYear(value.year());
  }

  // function runs the simulation on the click of the button
  const handleClick = (e) => {
    setSimulating(true);
    runSimulation();
  }

  // function sets the filter option for the autocomplete dropdown and restricts number of players
  // VISIBLE to the user within the search to OPTIONS_LIMIT
  const filterOptions = createFilterOptions({
    limit: OPTIONS_LIMIT
  });

  return (
    <Container maxWidth={'xl'}>
      <Grid
        container
        direction={"row"}
        spacing={3}
        justifyContent={'space-around'}
        alignItems={'center'}
        sx={{ marginTop: 0, marginBottom: 6 }}
      >
        {/* Row1 */}
        <Grid item xs={4}>
          <Typography
            variant="h3"
            align='left'
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            TopSpin Cup
          </Typography>
        </Grid>
        <Grid item xs={2} textAlign={'end'} pr={1}>
          <FormControl sx={{ width: '90%' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={'Competition Year'}
                views={['year']}
                slotProps={{ textField: { size: 'small', color: 'success' } }}
                disableFuture
                minDate={dayjs('1878', 'YYYY')}
                maxDate={dayjs('2023', 'YYYY')}
                onChange={(value, err) => handleYearFilter(value)}
                value={dayjs(year.toString(), 'YYYY')}
                disabled={simulating}
              />
            </LocalizationProvider>
          </FormControl>
        </Grid>
        <Grid item xs={2} textAlign={'start'} pl={1}>
          <FormControl sx={{ width: '90%' }}>
            <InputLabel id="select-league" color="success">
              League
            </InputLabel>
            <Select
              labelId="select-league"
              size="small"
              id="league"
              value={league}
              label="League"
              onChange={handleLeagueFilter}
              color="success"
              disabled={simulating}
            >
              <MenuItem value={"both"}>Both</MenuItem>
              <MenuItem value={"wta"}>Women's (WTA)</MenuItem>
              <MenuItem value={"atp"}>Men's (ATP)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={3} textAlign={'center'}>
          <FormControl sx={{ width: '60%' }}>
            <LoadingButton
              disabled={!validInput}
              variant='contained'
              color='success'
              size='medium'
              loading={simulating}
              loadingPosition='start'
              startIcon={<SportsTennisIcon />}
              onClick={(e) => handleClick(e)}
            >
              <span>{simulating ? 'Simulating...' : 'Run Simulation'}</span>
            </LoadingButton>
          </FormControl>
        </Grid>

        {/* Row2 display helper text */}
        <Grid container textAlign={'center'}>
          <Grid item xs={12}>
            <Box margin={'auto'}>
              <Typography
                variant='caption'
                align='center'
                color={'rgba(117, 114, 125, 1)'}
              >
                {'Filter player selection by year or league'.toUpperCase()}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Row3 for display of winner and error messages */}
        <Grid item xs={12} alignItems={'center'}>
          {
            showResults()
          }
        </Grid>

        {/* Row4 columns for data and selectors */}
        <Grid item xs={2}>
          {/* Round of 8 */}
          <Stack spacing={12}>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-1'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-1"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 1' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-1', value:value, reason:reason})}
              />
            </FormControl>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-2'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-2"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 2' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-2', value:value, reason:reason})}
              />
            </FormControl>
            
            {<Divider orientation="horizontal" flexItem />}

            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-3'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-3"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 3' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-3', value:value, reason:reason})}
              />
            </FormControl>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-4'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-4"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 4' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-4', value:value, reason:reason})}
              />
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={2}>
          {/* Round of 4 */}
          <Stack spacing={41}>
            <FormControl fullWidth>
              <TextField
                id='sf-1'
                label={sf1 ? sf1 : 'Semi-Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id='sf-2'
                label={sf2 ? sf2 : 'Semi-Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={2}>
          {/* Final */}
          <Stack>
            <FormControl fullWidth>
              <TextField
                id='f-1'
                label={f1 ? f1 : 'Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={2}>
          {/* Final */}
          <Stack>
            <FormControl fullWidth>
              <TextField
                id='f-2'
                label={f2 ? f2 : 'Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={2}>
          {/* Round of 4 */}
          <Stack spacing={41}>
            <FormControl fullWidth>
              <TextField
                id='sf-3'
                label={sf3 ? sf3 : 'Semi-Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id='sf-4'
                label={sf4 ? sf4 : 'Semi-Finalist'}
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={2}>
          {/* Round of 8 */}
          <Stack spacing={12}>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-5'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-5"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 5' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-5', value:value, reason:reason})}
              />
            </FormControl>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-6'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-6"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 6' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-6', value:value, reason:reason})}
              />
            </FormControl>

            {<Divider orientation="horizontal" flexItem />}

            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-7'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-7"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 7' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-7', value:value, reason:reason})}
              />
            </FormControl>
            <FormControl fullWidth>
              <Autocomplete
                key={year.toString()+'p-8'} // forces component to rerender when year changes, which signals a change in the list of possible players
                filterOptions={filterOptions}
                disabled={simulating}
                size='small'
                disablePortal
                id="p-8"
                options={playerList}
                sx={{ width: '100%' }}
                getOptionKey={(option) => option.id}
                renderInput={(params) => 
                  <TextField {...params} label='Player 8' color='success' />
                }
                onChange={(e, value, reason) => processPlayerSelection({id:'p-8', value:value, reason:reason})}
              />
            </FormControl>
          </Stack>
        </Grid>

        {/* Row5 display helper text */}
        { 
          winner 
          ?
            <Grid item xs={12} textAlign={'center'}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearSimulation}
              >
                Reset Simulation
              </Button>
            </Grid>
          :
          <></>
        }
      </Grid>
    </Container>
  )
}