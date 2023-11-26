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
  debounce
} from '@mui/material';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
// const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

export default function PlayerProfilePage() {
  const { id } = useParams();

  // const [playerImages, setPlayerImages] = useState([]);
  const [playerInfo, setPlayerInfo] = useState({}); // variable for player info
  const [playerSurfaces, setPlayerSurfaces] = useState([]); // variable for player's best and worst match surfaces historically
  const [playerStats, setPlayerStats] = useState({}); // variable for player stats
  const [playerMatches, setPlayerMatches] = useState([]); // track changes to matches

  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}`) // send get request to /player/:id route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      console.log("Player info:", resJson) // TODO: Delete
      setPlayerInfo(resJson)
    }) // set player info
    .catch(err => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player/${id}/surface`) // send get request to /player/:id/surface route on server
    .then(res => res.json()) // convert response to json
    .then(resJson => {
      console.log("Surface preferences:", resJson) // TODO: Delete
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
      <h1>{playerInfo.name}</h1>
      <h5>See console to check success of requests to other routes</h5>
    </Container>
  );
}
