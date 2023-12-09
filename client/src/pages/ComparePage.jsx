import { useEffect, useState } from "react";
import { Grid, Typography, Container, Avatar } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function ComparePage() {
  // initial state objects for player 1 and player 2 (default name is Player 1 and Player 2, ids are null)
  const [player1, setPlayer1] = useState({ name: "Player 1", id: null });
  const [player2, setPlayer2] = useState({ name: "Player 2", id: null });
  // const [player1Data, setPlayer1Data] = useState({});
  // const [player2Data, setPlayer2Data] = useState({});
  const [compareData, setCompareData] = useState([]);
  const [displayCompareCard, setDisplayCompareCard] = useState(false);

  // GET req to /compare/:player1/:player2 to compare two selected players
  useEffect(() => {
    if (player1.id && player2.id) {
      fetch(
        `http://${SERVER_HOST}:${SERVER_PORT}/api/compare/${player1.id}/${player2.id}`
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          setCompareData(res);
        })
        .catch((err) => console.log(err));
    }
  }, [player1, player2]); // runs when a change is made to either player, but a non-null id must be present for both

  // use effect to set each players data once compare data is retrieved
  useEffect(() => {
    if (compareData.length > 0) {
      setDisplayCompareCard(true);
    }
  }, [compareData]); // triggered when compareData changes (should only occur after GET req after selecting two players)

  // constructs the compare card, which displays all player results
  const compareCard = () => {
    if (displayCompareCard) {
      return (
        <Grid
          marginTop={5}
          marginBottom={8}
          container
          spacing={2}
          maxWidth={"sm"}
          textAlign={"center"}
          justifyContent={"center"}
        >
          <Grid item xs={12}>
            <Typography variant="h5">Career match results</Typography>
          </Grid>
          {compareResultLine("Total games played", "total_games")}
          {compareResultLine("Career wins", "wins")}
          {compareResultLine(
            "Career winning percentage",
            "win_percentage",
            true
          )}
          {compareResultLine("Career minutes played", "ttl_ovr_minutes")}
          {compareResultLine("Average duration", "avg_ovr_minutes")}
          {compareResultLine("Average aces", "avg_ovr_ace")}
          {compareResultLine("Average double faults", "avg_ovr_df")}
          {compareResultLine("Average serve points", "avg_ovr_svpt")}
          {compareResultLine("Average first serves made", "avg_ovr_1stIn")}
          {compareResultLine(
            "Average first serve points won",
            "avg_ovr_1stWon"
          )}
          {compareResultLine(
            "Average second serve points won",
            "avg_ovr_2ndWon"
          )}
          {compareResultLine("Average serve games", "avg_ovr_SvGms")}
          {compareResultLine("Average break points saved", "avg_ovr_bpSaved")}
          {compareResultLine("Average break points faced", "avg_ovr_bpFaced")}
        </Grid>
      );
    }
  };

  // constructs individual result lines in the compare card
  const compareResultLine = (
    categoryName,
    category,
    isWinPercentage = false
  ) => {
    return (
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3}>
            <Typography>
              {compareData[0][category] !== null
                ? formatNumber(compareData[0][category], isWinPercentage)
                : "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{categoryName}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>
              {compareData[1][category] !== null
                ? formatNumber(compareData[1][category], isWinPercentage)
                : "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  // function to assist in the formatting of player statistics
  const formatNumber = (num, isWinPercentage) => {
    if (isWinPercentage) {
      return Math.round(num * 100) + "%";
    }
    return (Math.round((num + Number.EPSILON) * 100) / 100).toLocaleString();
  };

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

  const clickPlayerOne = () => {
    setPlayer1({ name: "Bilal Ali", id: 1 });
  };

  const clickPlayerTwo = () => {
    setPlayer2({ name: "Jess Escobar", id: 2 });
  };

  // constructs the player avatar, which can be clicked to select a player
  const playerAvatar = (player, clickPlayer) => {
    return (
      <>
        <Avatar
          onClick={() => clickPlayer()}
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
        </Avatar>
        <Typography marginTop={2} textAlign={"center"}>
          {player.name}
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

        {/* Player avatars and names */}
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          marginTop={5}
        >
          <Grid item xs={2} marginRight={5}>
            {playerAvatar(player1, clickPlayerOne)}
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
            {playerAvatar(player2, clickPlayerTwo)}
          </Grid>
        </Grid>

        {compareCard()}
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
