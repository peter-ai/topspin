import { Container, Grid, Stack, Typography, FormControl, Select, InputLabel, MenuItem, TextField, Autocomplete, createFilterOptions, Divider, Box } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function SimulationPage() {
  const OPTIONS_LIMIT = 500; // number of players to show in autocomplete list

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


  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/simulation/${year}/${league}`)
      .then((res) => res.json())
      .then((resJson) => setPlayerList(resJson))
      .catch((err) => console.log(err));
  }, [year, league]);


  // function handles change of league dropdown
  const handleLeagueFilter = (e) => {
    e.preventDefault();
    setLeague(e.target.value); // set variable to current value of league selected
  };

  const handleYearFilter = (value) => {
    setYear(value.year());
  }

  const handleClick = (e) => {
    setSimulating(true);
  }

  const filterOptions = createFilterOptions({
    limit: OPTIONS_LIMIT
  });


  const processPlayerSelection = ({e=null, id=null, value, reason=null}) => {
    var round;
    var seed;

    if (id) {
      round = id.split('-')[0];
      seed = parseInt(id.split('-')[1]) - 1; // get the specific selector number
      if (round === 'p') {
        tournament[seed] = reason === 'selectOption' ? value.id : null; // if reason is clear set value to null
      }
    }
    

    if (!tournament.some(element => element === null) && new Set(tournament).size === 8) {
      // if array contains no null values and no duplicate values, valid input, allow simulation
      setErrorLoc([]);
      setError(false);
      setValidInput(true);
    } else if (!tournament.some(element => element === null) && new Set(tournament).size < 8) {
      // if array has no null values but contains duplicates show warning, disallow simulation
      const duplicates = [];
      for (let i = 0; i < tournament.length; i++) {
        if (tournament.indexOf(tournament[i]) !== i) {
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
          <FormControl sx={{ width: '80%' }}>
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
          <FormControl sx={{ width: '80%' }}>
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
              onClick={(e) => handleClick(e)} // to be updated with logic
            >
              <span>{simulating ? 'Simulating...' : 'Run Simulation'}</span>
            </LoadingButton>
          </FormControl>
        </Grid>

        {/* Row2 for winner, error messages, and loading bar */}
        <Grid item xs={12} alignItems={'center'}>
          {
            error
            ?
            <Box 
              textAlign={'center'}
            >
            <WarningAmberIcon color='error' />
            <Typography
              color={'error.main'}
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
            </Box>
            :
            ''
          }
        </Grid>


        {/* Row3 columns for data and selectors */}
        <Grid item xs={2}>
          {/* Round of 8 */}
          <Stack spacing={12}>
            <FormControl fullWidth>
              <Autocomplete
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
                label="Semi Finalist"
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id='sf-2'
                label="Semi Finalist"
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
                label="Finalist"
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
                label="Finalist"
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
                label="Semi Finalist"
                size='small'
                disabled
              >
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                id='sf-4'
                label="Semi Finalist"
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
      </Grid>
    </Container>
  )
}