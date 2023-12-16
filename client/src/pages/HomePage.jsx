import { useEffect, useState } from "react";
import { Box, Container, Grid, Skeleton, Typography } from "@mui/material";
import { popular_players } from '../utils';
import Typewriter from 'typewriter-effect';


// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

// Bing image search API key
const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

// Predefined list of players to search
const player_name = popular_players[Math.floor(Math.random()*popular_players.length)]


export default function HomePage() {
  // define the typewriter text to use
  const origin = `/origin/ From Anglo-French <i>tenetz</i>, meaning 'Hold! Take! Receive!',
  originally called out by players before serving.`;
  const definition = `/definition/ A game in which two or four players strike a ball with rackets over 
  a net stretched across a court, usually played with a felt-covered hollow rubber ball on a 
  grass, clay, or artificial surface.`;

  // player image url
  const [imageURL, setImageURL] = useState('');


  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/`)
      .then((res) => res.text())
      .then((resJson) => console.log(resJson))
      .catch((err) => console.log(err));

    // bing image search the randomly selected player
    fetch(`https://api.bing.microsoft.com/v7.0/images/search?` + 
      `q=${encodeURI(player_name + ' playing tennis')}&` +
      `mkt=en-us&` + 
      `safeSearch=moderate&`+
      `count=1&` + 
      `offset=0&` + 
      `aspect=Square&` +
      `imageType=Photo&`, 
      {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key' : API_KEY
        } 
      }
    )
      .then(res => res.json())
      .then(resJson => resJson.value[0])
      .then(resVal => setImageURL(resVal.thumbnailUrl))
      .catch(err => console.log(err));
  }, []);

  
  return (
    <Container maxWidth="xl">
      <Grid
        container
        direction="row"
        maxWidth="xl"
        alignItems={"center"}
        marginTop="100px"
        marginBottom="20px"
        width="100%"
        marginX="auto"
      >
        <Grid item xs={6} textAlign="center">
          <Typography
            variant="h1"
            fontWeight="bold"
            color="success.main"
            marginBottom="20px"
          >
            TopSpin
          </Typography>
          <Typography variant="h3">Advanced Tennis Analytics</Typography>
        </Grid>
        <Grid item xs={6}>
          <Box
            component="img"
            sx={{
              maxWidth: "sm",
              borderRadius: "50%",
            }}
            src="/src/assets/imgs/homepage.gif"
            title="gif of tennis player serving a ball"
          />
        </Grid>
        <Grid item xs={12} textAlign={"center"} align={'center'} pt={5} px={25}>
          <Box height={72}>
            <Typography
              variant="6"
              fontWeight={300}
            >
              <strong>ten·nis</strong> [singular noun] 
              <br/>
              <Typewriter
                options={{
                  strings: [origin, definition],
                  autoStart: true,
                  loop: true,
                  pauseFor: 2500,
                  delay: 35,
                  deleteSpeed: 30
                }}
              />
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={5} textAlign={"center"} pt={20} pb={6}>
          {
            imageURL 
            ?
            <Box 
              component={"img"}
              sx={{
                borderRadius: "1%",
                border: 5,
                height: 500,
                width: "80%"
              }}
              src={imageURL}
              title={"Image of " + player_name + " from Bing image search"}
            />
            :
            <Skeleton variant="rounded" height={500} width={"80%"} sx={{margin:"auto"}}/>
          }              
          <Typography 
            align="center"
            variant="h6"
            fontWeight={300}
          >
            {player_name}
          </Typography>
            
        </Grid>
        <Grid item xs={7} alignSelf={"flex-start"} pt={20} pb={6}>
          <Typography 
            align="center"
            variant="h5"
            fontWeight={300}
          >
            With origins dating back as early as the 12th century, tennis
            has continued to evolve over time, growing into a global sport. 
            <br/><br/>
            <strong>TopSpin</strong> is a web application that embraces the 
            modern analytical components and perspectives of sport, 
            bridging the gap between all eras of tennis. Built for 
            fanactics, casual fans, and newcomers alike, here you will discover
            your favorite players, active or retired, as well as information about
            historical performances and infamous matchups.
            <br/><br/>
            Checkout past tournament draws and by creating your dream matches,
            comparing players, and simulating tournament-style play, seek answers 
            to the age old question: <i>who is the greatest of all time?</i>
            <br/><br/>
            If in search of some betting inspiration, a few strategies are shown,
            that, well... may or may not work 🤷.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
