import { useEffect, useState } from 'react';
import { InputLabel, Select, MenuItem, FormControl, Grid, Container, Typography, Link } from '@mui/material';
import SearchBar from "../component/SearchBar";
import { lookup } from "country-data";

console.log(lookup.countries({ioc: ''}));
console.log(lookup.countries({alpha3: 'GLP'}));

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
  const [players, setPlayers] = useState([]); // variable for list of players
  const [searchInput, setSearchInput] = useState(''); // variable tracking state of search bar
  const [leagueInput, setLeagueInput] = useState('Both');
  const [pageSize, setPageSize] = useState(30);
  const [page, setPage] = useState(1);
  
  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player?` +
      `search=${searchInput}&` +
      `league=${leagueInput}` + 
      `pageSize=${pageSize}` +
      `page=${page}`
    ) // send get request to /player route on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setPlayers(resJson)) // set players 
    .catch((err) => console.log(err)); // catch and log errors
  }, []); // [] empty listener, so only run effect on load of page

  // function handles change of league dropdown
  const handleChange = (e) => {
    e.preventDefault();
    setLeagueInput(e.target.value);
  }
  
  // function to set state of search bar
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value); // set variable to the current value of search bar
  };

  // function that handles getting the country and flag of players
  const getFlag = (player_ioc) => {
    if (!player_ioc || player_ioc==='UNK') {return 'NO DATA'}

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
  const searchPlayers = () => {
    return players.filter((player) => {
      return (
        (leagueInput === 'Both' || player.league === leagueInput.toLowerCase()) && // if league is Both or player league matches input league
        player.name.toLowerCase().includes(searchInput.toLowerCase()) // if player name includes the search string, empty str matches true for all
      )
    }).map((player) => (
      // construct list of players to display
      <Grid item key={player.id} xs={2} style={{textAlign:'center'}}>
        <Link href={'/player/'+player.id} variant={'body1'} underline={'hover'}>
          {player.name}
        </Link>
        <br/>
        {getFlag(player.ioc)}
        <br/>
        {player.league.toUpperCase()}
      </Grid>
    ));
  };

  return (
    <Container maxWidth='xl'>
      <Grid container direction={'row'} spacing={2} alignItems={'center'} sx={{marginTop: 0}}>
        <Grid item xs={8}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 300,
              letterSpacing: '.2rem',
            }}
            gutterBottom
          >
            Player Directory
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
              onChange={handleChange}
              color='success'
            >
              <MenuItem value={'Both'}>Both</MenuItem>
              <MenuItem value={'WTA'}>Women's (WTA)</MenuItem>
              <MenuItem value={'ATP'}>Men's (ATP)</MenuItem>
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

        {searchPlayers()}
      </Grid>
    </Container>
  );
}