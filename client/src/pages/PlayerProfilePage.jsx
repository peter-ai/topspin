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
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import SportsTennisTwoToneIcon from '@mui/icons-material/SportsTennisTwoTone';
import QueryStatsTwoToneIcon from '@mui/icons-material/QueryStatsTwoTone';
import HourglassBottomTwoToneIcon from '@mui/icons-material/HourglassBottomTwoTone';
import PercentTwoToneIcon from '@mui/icons-material/PercentTwoTone';
import atp_logo_1 from '../public/atp-silhouette-1.png';
import wta_logo_1 from '../public/wta-silhouette-1.png';
import { getPlayerFlag, getDate, getPlayerHand } from '../component/utils';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
// const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

export default function PlayerProfilePage() {
  const { id } = useParams(); // get player id parameter from url
  const [tab, setTab] = useState(0); // track state of tab selection by user


  // const [playerImages, setPlayerImages] = useState([]);
  const [playerInfo, setPlayerInfo] = useState({}); // variable for player info
  const [playerWinLoss, setPlayerWinLoss] = useState([]); // variable for historical win-loss analytics
  const [playerSurfaces, setPlayerSurfaces] = useState([]); // variable for player's best and worst match surfaces historically
  const [playerStats, setPlayerStats] = useState({}); // variable for player stats
  const [playerMatches, setPlayerMatches] = useState([]); // track changes to matches

  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}`) // send get request to /player/:id route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => setPlayerInfo(resJson)) // set player info
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/winloss`) // send get request to /player/:id/surface route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      if (resJson.length > 3) {
        const data = Array();
        let curr_year;
    
        for (let i=0; i < (resJson.length - 1); i++) {
          curr_year = resJson[i];
          data.push(curr_year);
    
          if (curr_year.year + 1 !== resJson[i+1].year) {
            data.push({year: curr_year.year + 1, wins: null, losses: null})
          }
        }
        setPlayerWinLoss(data);
      } else {
        setPlayerWinLoss(resJson);
      }
    })
    // .then(resJson => setPlayerWinLoss(resJson)) // set player surface preferences
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/surface`) // send get request to /player/:id/surface route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => setPlayerSurfaces(resJson)) // set player surface preferences
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

  //
  const showPlayerInfo = () => {
    if (playerInfo && Object.keys(playerInfo).length) {
      return (
        <>
          <b>League:</b> {playerInfo.league.toUpperCase()}
          <br/>
          <b>Height:</b> {playerInfo.height ? playerInfo.height + ' cm' : 'N/A'}
          <br/>
          <b>IOC:</b> {getPlayerFlag(playerInfo.ioc)}
          <br/>
          <b>Dominant Hand:</b> {getPlayerHand(playerInfo.hand)}
          <br/>
          <b>DOB:</b> {getDate(playerInfo.dob, 'player')}
        </>
      );
    } else {
      return (
        <Skeleton variant='rounded' height={250}/>
      );
    }
  };

  //
  const showSurfaceStats = () => {
    if (playerSurfaces && playerSurfaces.length >= 0) {
      if (playerSurfaces.length === 2) {
        return (
          <>
            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'success.main', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.wins !== null
                    ?  
                    (<b>{playerStats.wins} career {playerStats.wins === 1 ? 'win': 'wins'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
                <Typography variant='body1'>
                  <b>{Math.round(playerSurfaces[0].win_percentage*100)}% </b>
                  win rate on <b>{playerSurfaces[0].surface.toLowerCase()}</b> courts
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'error.light', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.losses !== null
                    ?  
                    (<b>{playerStats.losses} career {playerStats.losses === 1 ? 'loss': 'losses'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
                <Typography variant='body1'>
                  <b>{Math.round(playerSurfaces[1].win_percentage*100)}% </b> 
                  win rate on <b>{playerSurfaces[1].surface.toLowerCase()}</b> courts
                </Typography>
              </Stack>
            </Grid>
          </>
        );
      } else if (playerSurfaces.length === 1) {
        return (
          <>
            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'success.main', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.wins !== null
                    ?  
                    (<b>{playerStats.wins} career {playerStats.wins === 1 ? 'win': 'wins'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'error.light', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.losses !== null
                    ?  
                    (<b>{playerStats.losses} career {playerStats.losses === 1 ? 'loss': 'losses'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1'>
                <b>{Math.round(playerSurfaces[0].win_percentage*100)}% </b>
                win rate on <b>{playerSurfaces[0].surface.toLowerCase()}</b> courts
              </Typography>
            </Grid>
          </>
        );
      } else {
        return (
          <>
            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'success.main', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.wins !== null
                    ?  
                    (<b>{playerStats.wins} career {playerStats.wins === 1 ? 'win': 'wins'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1} sx={{':hover': {color:'error.light', transition: '250ms'}}}>
                <Typography variant='body1'>
                  {
                    playerStats.losses !== null
                    ?  
                    (<b>{playerStats.losses} career {playerStats.losses === 1 ? 'loss': 'losses'}</b>)
                    :
                    (<Skeleton />)
                  }
                </Typography>
              </Stack>
            </Grid>
          </>
        );
      }
    } else {
      return (
        <Grid item xs={12}>
          <Skeleton variant='rounded' height={100}/>
        </Grid>
      );
    }
  };

  // function to render the content for each tab
  const renderTabContent = (tab_num) => {
    if (tab_num === 0) {return getHistoricalPerformance()}
    if (tab_num === 1) {return 'PERFORMANCE PLACEHOLDER'}
    if (tab_num === 2) {return 'MATCHES PLACEHOLDER'}
  };

  // function that defines analytics and visualizations
  const getHistoricalPerformance = () => {
    if (playerWinLoss && playerWinLoss.length !== 0) {
      if (playerWinLoss.length > 3) {
        return (
          <LineChart
            dataset={playerWinLoss}
            xAxis={[
              {
                dataKey: 'year',
                valueFormatter: (y) => y.toString(),
                tickMinStep: 1
              }
            ]}
            series={[
              { 
                dataKey:'wins', 
                label: 'Wins', 
                connectNulls: false,
                valueFormatter: (value) => (value == null ? 'No matches' : value.toString()),
                color: '#66bb6a' 
              },
              { 
                dataKey:'losses', 
                label: 'Losses', 
                connectNulls: false,
                valueFormatter: (value) => (value == null ? 'No matches' : value.toString()),
                color: '#e57373' 
              }
            ]}
            // width={900}
            // height={510}
          />
        )
      } else {
        return (
          <BarChart 
            dataset={playerWinLoss}
            xAxis={[{ scaleType: 'band', dataKey: 'year', valueFormatter: (y) => y.toString()}]}
            series={[
              { dataKey: 'wins', label: 'Wins', color:'#66bb6a', 
                highlightScope: 
                {
                  highlighted: 'item',
                  faded: 'global',
                } 
              },
              { dataKey: 'losses', label: 'Losses', color: '#e57373',
                highlightScope: 
                {
                  highlighted: 'item',
                  faded: 'global',
                } 
              },
            ]}
            yAxis={[
              {tickMinStep:1}
            ]}
          />
        )
      }
    } else {
      return (
        <Skeleton variant='rounded' width={900} height={510}/>
      )
    }
  };

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

  
  // TODO: Figure out player surfaces logic
  // TODO: Figure out how to fill gaps in competition years

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
            playerInfo && Object.keys(playerInfo).length
            ?
            <Box
              component="img"
              sx={{
                width: '90%',
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
          <Typography variant='h4'>
            {playerInfo && Object.keys(playerInfo).length ? playerInfo.name : <Skeleton />}
          </Typography>
          <Stack alignItems={'center'} divider={<Divider orientation="horizontal" sx={{width: '100%', borderColor: 'primary.main'}} />} spacing={2} mt={1}>
            <Typography variant='body1'>
              {showPlayerInfo()}
            </Typography>
            <Grid container spacing={1} justifyContent={'center'}>
              {showSurfaceStats()}
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
            <Tab icon={<QueryStatsTwoToneIcon/>} label='Historical Performance' value={0} />
            <Tab icon={<PercentTwoToneIcon/>} label='Sport Analytics' value={1} />
            <Tab icon={<SportsTennisTwoToneIcon/>} label='Matches' value={2} />
          </Tabs>
          <Box width={tab === 0 ? '97%' : '100%'} height={tab === 0 ? 525 : '100%'} m={2}>
            {renderTabContent(tab)}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
