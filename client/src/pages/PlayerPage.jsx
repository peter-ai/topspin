import { useEffect, useState } from 'react';
import { 
  InputLabel,
  Select, 
  MenuItem, 
  FormControl, 
  Grid, 
  Container, 
  Typography, 
  Link, 
  Pagination, 
  Box, 
  Paper,
  Skeleton, 
  debounce
} from '@mui/material';
import SearchBar from '../component/SearchBar';
import { getPlayerFlag } from '../component/utils';
import atp_logo_1 from '../public/atp-silhouette-1.png';
import atp_logo_2 from '../public/atp-silhouette-2.png';
import wta_logo_1 from '../public/wta-silhouette-1.png';
import wta_logo_2 from '../public/wta-silhouette-2.png';


// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
  const [players, setPlayers] = useState([]); // variable for list of players
  const [searchInput, setSearchInput] = useState(''); // variable tracking state of search bar
  const [leagueInput, setLeagueInput] = useState('both'); // variable tracking the league selected
  const [pageSize, setPageSize] = useState(20); // variable tracking pageSize selection
  const [page, setPage] = useState(1); // variable tracking the page number selected
  const [count, setCount] = useState([]); // variable for number of players
  
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
    .then((resJson) => setCount(resJson)) // set count of players
    .catch((err) => console.log(err)); // catch and log errors
  }, [searchInput, leagueInput, pageSize, page]); 

  // function to set state of search bar
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value); // set variable to the current value of search bar
    handlePage(null, 1); // reset page number to the first when search occurs
  };

  // define function for debounced search to delay registration of keystrokes 
  // and querying every letter added to search
  const debounceSearch = debounce(handleSearch, 300);

  // function handles change of league dropdown
  const handleLeagueFilter = (e) => {
    e.preventDefault();
    setLeagueInput(e.target.value); // set variable to current value of league selected
    handlePage(null, 1); // reset page number to the first when new league selection occurs
  };

  // function handles change of page size dropdown
  const handlePageSize = (e) => {
    e.preventDefault();

    // if current page is outside bounds given new page size
    // change current page to last possible page
    if (Math.ceil(count.count/e.target.value) < page) {
      handlePage(null, Math.ceil(count.count/e.target.value));
    }
    setPageSize(e.target.value); // change page size
  };

  // function handles change of page number
  const handlePage = (e, value) => {
    setPage(value); // change the current page number
  };

  // function to output players based on matching search results for player names and specified league
  const getPlayers = () => {
    return players.map((player, index) => (
      // construct list of players to display
      <Grid item key={player.id} xs={3} sx={{textAlign:'center'}} justifyContent={'center'} alignItems={'center'}>
        <Paper 
          elevation={6}
        >
          <Box width="100%" p={2}>
            { 
              (<Link
              href={'/player/'+player.id} 
              sx={{
                ':hover': {
                  color: 'success.main',
                  transition: '250ms'
                }
              }}
              >
                <Box
                  component="img"
                  sx={{
                    height: 200,
                    width: 200,
                    borderRadius: '50%',
                    border: 3
                  }}
                  alt={player.league.toUpperCase() + ' tennis player silhouette'}
                  src={player.league==='atp' ? (player.id % 2 ? atp_logo_1 : atp_logo_2) : (player.id % 2 ? wta_logo_1 : wta_logo_2)}
                />
              </Link>) 
              ??
              (<Grid container justifyContent={'center'}>
                <Skeleton variant="circular" width={200} height={200}/>
              </Grid>)
            }
            <br/>
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
            {getPlayerFlag(player.ioc)}
            <br/>
            {player.league.toUpperCase()}
          </Box>
        </Paper>
      </Grid>
    ));
  };

  return (
    <Container maxWidth='xl'>
      <Grid container direction={'row'} spacing={3} justifyContent={'center'} alignItems={'center'} sx={{marginTop: 0}}>
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
          handleSearch={debounceSearch} 
        />
        </Grid>

        {getPlayers()}
        
        <Box width="100%" mt={1}/>

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
            siblingCount={2}
            onChange={handlePage}
          />
        </Grid>
      </Grid>
    </Container>
  );
}