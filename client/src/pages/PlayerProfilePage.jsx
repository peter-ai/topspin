import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  debounce,
  Stack,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import { lookup } from 'country-data';
import atp_logo_1 from '../public/atp-silhouette-1.png';
import wta_logo_1 from '../public/wta-silhouette-1.png';
import { getPlayerFlag, getDate, getPlayerHand } from '../component/utils';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
// const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);


  // const [playerImages, setPlayerImages] = useState([]);
  const [playerInfo, setPlayerInfo] = useState({}); // variable for player info
  const [playerSurfaces, setPlayerSurfaces] = useState([]); // variable for player's best and worst match surfaces historically
  const [playerStats, setPlayerStats] = useState({}); // variable for player stats
  const [playerMatches, setPlayerMatches] = useState([]); // track changes to matches

  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}`) // send get request to /player/:id route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => setPlayerInfo(resJson)) // set player info
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/surface`) // send get request to /player/:id/surface route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      console.log("Surface preferences:", resJson) // TODO: Delete
      setPlayerSurfaces(resJson)
    }) // set player surface preferences
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/stats`) // send get request to /player/:id/stats route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      console.log("Player stats:", resJson) // TODO: Delete
      setPlayerStats(resJson)
    }) // set player historical match stats
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/matches`) // send get request to /player/:id/matches route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      console.log("Player matches:", resJson) // TODO: Delete
      setPlayerMatches(resJson)
    }) // set player matches
    .catch(err => console.log(err)); // catch and log errors
  }, []) // [] empty listener, so only run effect on load of page

  // function facilitate the change of tabs
  const changeTab = (e, new_tab) => {
    setTab(new_tab);
  }
  // useEffect(() => {
  //   getPlayerImages();
  // }, [players])

  // // async function to perform Bing image searches
  // async function bingImage(player_name) {
  //   let player_res = await fetch(`https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURI(player_name)}&mkt=en-us&safeSearch=moderate&count=1&offset=0`, {
  //     method: 'GET',
  //     headers: {
  //       'Ocp-Apim-Subscription-Key' : API_KEY
  //     }
  //   });
  //   let player_json = await player_res.json();
  //   let player_val = await player_json.value[0];
  //   let player_url = await player_val.thumbnailUrl;
    
  //   return player_url;
  // }

  // // function to aggregate results form async Bing image search
  // const getPlayerImages = () => {
  //   const promises = [];
  //   players.forEach((player) => {
  //     promises.push(bingImage(player.name + ' tennis'));
  //   });
  //   Promise.all(promises).then((v) => setPlayerImages(v));
  // }


  // TODO: Player card and info to the left (1/4 columns)
  // TODO: Player stats to the right split by wins/losses/overall (3/4 columns)
  // TODO: Player matches in filterable table ordered by most recent match underneath stats or in swappable tab (3/4 columns)
  return (
    <Container maxWidth='xl'>
      {/* IMAGE */}
      {/* { 
        playerImages[index] ?
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
            alt={'Image of ' + player.name}
            src={playerImages[index]}
          />
        </Link>) :
        (<Grid container justifyContent={'center'}>
          <Skeleton variant="circular" width={200} height={200}/>
        </Grid>)
      } */}
      <Grid container direction={'row'} spacing={3} alignItems={'flex-start'} sx={{marginTop: 0}}> {/*justifyContent={'center'}*/}
        <Grid item xs={3} sx={{textAlign:'center'}} justifyContent={'center'} alignItems={'center'}>
          {(
            playerInfo.constructor != Array
            ?
            <Box
              component="img"
              sx={{
                height: 250,
                width: 250,
                borderRadius: '50%',
                border: 3,
                borderColor: 'primary.main',
              }}
              alt={' tennis player silhouette'}
              src={playerInfo.league==='atp' ? atp_logo_1 : wta_logo_1}
            />
            :
            <Skeleton variant="circular" width={250} height={250} sx={{margin: 'auto'}}/>
          )}
          <Typography variant='h4'>{playerInfo.name ? playerInfo.name : <Skeleton />}</Typography>
          <Stack alignItems={'center'} divider={<Divider orientation="horizontal" sx={{width: '100%', borderColor: 'primary.main'}} />} spacing={2} mt={1}>
            <Typography variant='body1'>
              {
                playerInfo.league
                ?
                <>
                  <b>League:</b> {playerInfo.league.toUpperCase()}
                </>
                :
                <Skeleton />
              }
              {
                playerInfo.height
                ?
                <>
                  <br/>
                  <b>Height:</b> {playerInfo.height ? playerInfo.height + ' cm' : 'N/A'}
                </>
                :
                <Skeleton />
              }
              {
                playerInfo.ioc
                ?
                <>
                  <br/>
                  <b>IOC:</b> {getPlayerFlag(playerInfo.ioc)}
                </>
                :
                <Skeleton />
              }
              {
                playerInfo.hand
                ?
                <>
                  <br/>
                  <b>Dominant Hand:</b> {getPlayerHand(playerInfo.hand)}
                </>
                :
                <Skeleton />
              }
              {
                playerInfo.dob
                ?
                <>
                  <br/>
                  <b>DOB:</b> {getDate(playerInfo.dob, 'player')}
                </>
                :
                <Skeleton />
              }
            </Typography>
            <Grid container justifyContent={'center'}>
              <Grid item xs={6}>
                {
                  (playerStats.constructor != Array && playerSurfaces.length > 0)
                  ?
                  <Stack spacing={1} sx={{':hover': {color:'success.light', transition: '250ms'}}}>
                    <Typography variant='body1'>
                      <b>{playerStats.wins} wins</b>
                    </Typography>
                    <Typography variant='body1'>
                      Best on {playerSurfaces[0].surface.toLowerCase()}
                    </Typography>
                    <Typography variant='body1'>
                      {playerSurfaces[0].surface} win % is {Math.round(playerSurfaces[0].win_percentage*100)}%
                    </Typography>
                  </Stack>
                  :
                  <Skeleton variant='rounded' height={100}/>
                }
              </Grid>
              <Grid item xs={6}>
                {
                  (playerStats.constructor != Array && playerSurfaces.length > 0)
                  ?
                  <Stack spacing={1} sx={{':hover': {color:'error.light', transition: '250ms'}}}>
                    <Typography variant='body1'>
                      <b>{playerStats.losses} losses</b>
                    </Typography>
                    <Typography variant='body1'>
                      Worst on {playerSurfaces[1].surface.toLowerCase()}
                    </Typography>
                    <Typography variant='body1'>
                      {playerSurfaces[1].surface} win % is {Math.round(playerSurfaces[1].win_percentage*100)}%
                    </Typography>
                  </Stack>
                  :
                  <Skeleton variant='rounded' height={100}/>
                }
              </Grid>
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={9}>
          <Tabs
            value={tab}
            onChange={changeTab}

            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
          >
            <Tab label='Charts' value={0}></Tab>
            <Tab label='Analytics' value={1}></Tab>
            <Tab label='Matches' value={2}></Tab>
          </Tabs>
        </Grid>
      </Grid>
    </Container>
  );
}
