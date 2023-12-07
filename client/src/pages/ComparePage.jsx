import { useEffect, useState } from "react";
import { Grid, Box, Typography, Container, Avatar } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function ComparePage() {
  // // state variables for player1 and player2
  // const [players, setPlayers] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  // const [compareData, setCompareData] = useState([]);
  const [arePlayersSelected, setArePlayersSelected] = useState(false);

  // GET req to /compare/:player1/:player2 to compare two selected players
  useEffect(() => {
    fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/compare/${player1}/${player2}`
    )
      .then((res) => res.json())
      .then((res) => setCompareData(res))
      .catch((err) => console.log(err));
  }, [arePlayersSelected]); // runs when a change is made to either player, but a value must be present for both

  // // GET request to /player
  // useEffect(() => {
  //   fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/player`)
  //     .then((res) => res.json())
  //     .then((res) => setPlayers(res.slice(0, 10)))
  //     .catch((err) => console.log(err));
  // }, []); // run on page load

  // // TODO abstract these into a single helper function
  // // handles change for player1 and player2
  // const handlePlayer1Change = (e) => {
  //   e.preventDefault();
  //   setPlayer1(e.target.value);
  // };

  // // handles change for player1 and player2
  // const handlePlayer2Change = (e) => {
  //   e.preventDefault();
  //   setPlayer2(e.target.value);
  // };

  // // TODO logs compare data to screen for now
  // useEffect(() => {
  //   console.log(compareData);
  // }, [compareData]);

  const playerAvatar = (playerName) => {
    return (
      <>
        <Avatar
          sx={{
            width: 180,
            height: 180,
            margin: "auto",
            transition: "transform 0.225s ease-in-out",
            ":hover": {
              borderStyle: "dashed",
              borderWidth: 4,
              cursor: "pointer",
            },
          }}
        >
          <PersonAddIcon fontSize="large" />
        </Avatar>{" "}
        <Typography marginTop={2} textAlign={"center"}>
          {playerName}
        </Typography>
      </>
    );
  };

  return (
    <Container maxWidth="xl">
      <Grid
        container
        direction={"row"}
        spacing={3}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ marginTop: 0 }}
      >
        {/* Page title and tagline */}
        <Grid item xs={5}>
          <Typography
            variant="h3"
            textAlign="left"
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            Compare Players
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography
            variant="h5"
            textAlign="right"
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            Pick two players and compare their career performance!
          </Typography>
        </Grid>

        <Grid
          container
          alignItems="center"
          justifyContent="center"
          marginTop={5}
        >
          <Grid item xs={2} marginRight={5}>
            {playerAvatar("Player 1")}
          </Grid>
          <Grid item xs={1} marginBottom={5}>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{
                fontWeight: 300,
                letterSpacing: ".2rem",
              }}
            >
              vs
            </Typography>
          </Grid>
          <Grid item xs={2} marginLeft={5}>
            {playerAvatar("Player 2")}
          </Grid>
        </Grid>

        {/* Player avatars
        <Grid item xs={5}>
          Player1
        </Grid>
        <Grid item xs={2}>
          vs
        </Grid>
        <Grid item xs={5}>
          Player2
        </Grid> */}
      </Grid>
    </Container>
  );

  // return (
  //   <>
  //     <h1>Compare</h1>
  //     <h2>Pick two players and compare their career performance!</h2>
  //     <select name="player1" id="player1" onChange={handlePlayer1Change}>
  //       <option value="">Select a player</option>
  //       {players.map((player) => (
  //         <option key={player.id} value={player.id}>
  //           {player.name}
  //         </option>
  //       ))}
  //     </select>
  //     <select name="player2" id="player2" onChange={handlePlayer2Change}>
  //       <option value="">Select a player</option>
  //       {players.map((player) => (
  //         <option key={player.id} value={player.id}>
  //           {player.name}
  //         </option>
  //       ))}
  //     </select>
  //   </>
  // );
}
