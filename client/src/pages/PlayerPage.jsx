import { useEffect, useState } from 'react';
import { InputLabel, Select, MenuItem, FormControl, Grid, Container, Typography, Link, Pagination, Box, Paper } from '@mui/material';
import SearchBar from "../component/SearchBar";
import { lookup } from "country-data";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
  const [players, setPlayers] = useState([]); // variable for list of players
  const [searchInput, setSearchInput] = useState(''); // variable tracking state of search bar
  const [leagueInput, setLeagueInput] = useState('both');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState([]);
  
  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player?` +
      `search=${searchInput}&` +
      `league=${leagueInput}&` + 
      `pageSize=${pageSize}&` +
      `page=${page}&` +
      `count=false`
    ) // send get request to /player route on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setPlayers(resJson)) // set players 
    .catch((err) => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player?` +
      `search=${searchInput}&` +
      `league=${leagueInput}&` + 
      `pageSize=${pageSize}&` +
      `page=${page}&` +
      `count=true`
    ) // send get request to /player route on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setCount(resJson)) // set players 
    .catch((err) => console.log(err)); // catch and log errors
  }, [searchInput, leagueInput, pageSize, page]); // [] empty listener, so only run effect on load of page
    
  // function to set state of search bar
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value); // set variable to the current value of search bar
    handlePage(null, 1);
  };

  // function handles change of league dropdown
  const handleLeagueFilter = (e) => {
    e.preventDefault();
    setLeagueInput(e.target.value);
    handlePage(null, 1);
  };

  // function handles change of page size dropdown
  const handlePageSize = (e) => {
    e.preventDefault();
    setPageSize(e.target.value);
  };

  const handlePage = (e, value) => {
    setPage(value);
  };


  // function that handles getting the country and flag of players
  const getFlag = (player_ioc) => {
    if (!player_ioc || player_ioc==='UNK') {return 'N/A'}

    const unmatched = {
      AHO: 'Netherlands Antilles',
      CAR: 'Carribean/West Indies',
      URS: 'Soviet Union (USSR)',
      FRG: 'West Germany',
      GDR: 'East Germany',
      TCH: 'Czechoslovakia',
    };
    if (unmatched[player_ioc]) {return unmatched[player_ioc]}

    let country = lookup.countries({ioc: player_ioc})
    if (!country.length) {
      country = lookup.countries({alpha3: player_ioc});
      if (!country.length) {
        return 'N/A';
      } 
    }

    if (country[0]['emoji']) {
      return country[0]['emoji'] + ' ' + country[0]['name'].split(', ')[0];
    } else {
      return country[0]['name'].split(', ')[0];
    }
  };
  
  // function to output players based on matching search results for player names and specified league
  const getPlayers = () => {
    return players.map((player) => (
      // construct list of players to display
      <Grid item key={player.id} xs={3} sx={{textAlign:'center'}}>
        <Paper 
          elevation={6}
        >
          <Box width="100%" p={2}>
            <Link 
            href={'/player/'+player.id} 
            variant={'body1'} 
            sx={{
              fontWeight:700, 
              ':hover': {
                color: 'success.main',
                transition: '250ms'
              }
            }} 
            underline={'none'}
            >
              {player.name}
            </Link>
            <br/>
            {getFlag(player.ioc)}
            <br/>
            {player.league.toUpperCase()}
          </Box>
        </Paper>
      </Grid>
    ));
  };

  // TODO: Fix search bug where search doesn't show results because page calculation is off (somehow need to reset to latest page)
  // TODO: Add space below players and the pagination feature
  // TODO: Find api for player images
  return (
    <Container maxWidth='xl'>
      <Grid container direction={'row'} spacing={3} alignItems={'center'} sx={{marginTop: 0}}>
        <Grid item xs={6}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 300,
              letterSpacing: '.2rem',
            }}
            gutterBottom
          >
            Athlete Directory
          </Typography>
        </Grid>
        <Grid container item xs={2} justifyContent={'center'} alignItems={'center'} sx={{textAlign:'center'}}>
          <Typography
            variant='body1'
            sx={{
              fontWeight: 300,
              letterSpacing: '.2rem',
            }}
            gutterBottom
          >
            {count.count ? count.count.toString() + ' Player' + (count.count > 1 ? 's' : '') : '0 Players'}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <FormControl fullWidth> 
            <InputLabel id='select-league' color='success'>League</InputLabel>
            <Select
              labelId='select-league'
              size='small'
              id='league'
              value={leagueInput}
              label='League'
              onChange={handleLeagueFilter}
              color='success'
            >
              <MenuItem value={'both'}>Both</MenuItem>
              <MenuItem value={'wta'}>Women's (WTA)</MenuItem>
              <MenuItem value={'atp'}>Men's (ATP)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <SearchBar 
          defaultValue={searchInput} 
          placeholder='Name' 
          handleSearch={handleSearch} 
        />
        </Grid>

        {getPlayers()}
        
        <Box width="100%" mt={4}/>

        <Grid container item xs={12} justifyContent={'flex-end'} alignItems={'center'}>
          <FormControl sx={{minWidth: 90}}> 
              <InputLabel id='select-pagesize' color='success'>Players</InputLabel>
              <Select
                labelId='select-pagesize'
                size='small'
                id='pagesize'
                value={pageSize}
                label='Players'
                onChange={handlePageSize}
                color='success'
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={60}>60</MenuItem>
                <MenuItem value={120}>120</MenuItem>
                <MenuItem value={240}>240</MenuItem>
              </Select>
          </FormControl>
          <Pagination
            page={page}
            count={count.count ? Math.ceil(count.count/pageSize) : 1}
            color='success'
            showFirstButton 
            showLastButton
            onChange={handlePage}
          />
        </Grid>
      </Grid>
    </Container>
  );
}