import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Container,
  Avatar,
  Badge,
  Autocomplete,
} from "@mui/material";
import ArrowLeftSharpIcon from "@mui/icons-material/ArrowLeftSharp";
import ArrowRightSharpIcon from "@mui/icons-material/ArrowRightSharp";
import AddIcon from "@mui/icons-material/Add";
import atp_logo_1 from "../assets/imgs/atp-silhouette-1.png";
import atp_logo_2 from "../assets/imgs/atp-silhouette-2.png";
import wta_logo_1 from "../assets/imgs/wta-silhouette-1.png";
import wta_logo_2 from "../assets/imgs/wta-silhouette-2.png";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function ComparePage() {
  // initial state objects for player 1 and player 2 (default name is Player 1 and Player 2, ids are null)
  const [player1, setPlayer1] = useState({
    name: "Player 1",
    id: null,
    src: "",
  });
  const [player2, setPlayer2] = useState({
    name: "Player 2",
    id: null,
    src: "",
  });
  const [compareData, setCompareData] = useState([]);
  const [displayCompareCard, setDisplayCompareCard] = useState(false);
  const [league, setLeague] = useState("both"); // league filter
  const [playerList, setPlayerList] = useState([]); // players that match filters

  // retrieves new list of players whenever the league filter is toggled
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/simulation/2023/${league}`)
      .then((res) => res.json())
      .then((resJson) => setPlayerList(resJson))
      .catch((err) => console.log(err));
  }, [league]);

  // retrives list of players on initial entry
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/simulation/2023/${league}`)
      .then((res) => res.json())
      .then((resJson) => {
        setPlayerList(resJson); // update with new player list
      })
      .catch((err) => console.log(err));
  }, []);

  // GET req to /compare/:player1/:player2 to compare two selected players
  useEffect(() => {
    if (player1.id && player2.id) {
      fetch(
        `http://${SERVER_HOST}:${SERVER_PORT}/api/compare/${player1.id}/${player2.id}`
      )
        .then((res) => res.json())
        .then((res) => setCompareData(res))
        .catch((err) => console.log(err));
    }
  }, [player1, player2]); // runs when a change is made to either player, but a non-null id must be present for both

  // use effect to set each players data once compare data is retrieved
  useEffect(() => {
    if (compareData.length > 0) {
      setDisplayCompareCard(true);
    }
  }, [compareData]); // triggered when compareData changes (should only occur after GET req after selecting two players)

  // function to assist in the formatting of player statistics
  const formatNumber = (num, isWinPercentage) => {
    if (isWinPercentage) {
      return Math.round(num * 100) + "%";
    }
    return (Math.round((num + Number.EPSILON) * 100) / 100).toLocaleString();
  };

  // select image based on player's league and id
  const getPlayerSrc = (league) => {
    // src={
    //   player.league === "atp"
    //     ? player.id % 2
    //       ? atp_logo_1
    //       : atp_logo_2
    //     : player.id % 2
    //     ? wta_logo_1
    //     : wta_logo_2
    // }

    return league === "atp"
      ? 25 % 2
        ? atp_logo_1
        : atp_logo_2
      : 25 % 2
      ? wta_logo_1
      : wta_logo_2;
  };

  const clickPlayerOne = () => {
    setPlayer1({
      name: "Bilal Ali",
      id: 1,
      src: getPlayerSrc("atp"),
    });
  };

  const clickPlayerTwo = () => {
    setPlayer2({
      name: "Jess Escobar",
      id: 2,
      src: getPlayerSrc("atp"),
    });
  };

  // constructs the player avatar, which can be clicked to select a player
  const playerAvatar = (player, clickPlayer) => {
    return (
      <Grid item container xs={2} marginX={5} justifyContent={"center"}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Avatar
              sx={{
                border: "2px solid",
                ":hover": {
                  cursor: "pointer",
                  color: "success.main",
                },
              }}
              onClick={() => clickPlayer()}
            >
              <AddIcon fontSize="small" />
            </Avatar>
          }
        >
          <Avatar
            sx={{
              width: 180,
              height: 180,
              border: player.src === "" ? "2px dashed" : "",
              color: "white",
            }}
            src={player.src}
          ></Avatar>
        </Badge>

        <Typography marginTop={2} textAlign={"center"} variant="h5">
          {player.name}
        </Typography>
      </Grid>
    );
  };

  // generates arrow for player with better result in each category
  const isWinner = (category, direction) => {
    const isMinResult = ["avg_ovr_df", "avg_ovr_bpFaced"];
    if (
      compareData[0][category] !== null &&
      compareData[1][category] !== null
    ) {
      if (direction === "left") {
        return isMinResult.includes(category)
          ? compareData[0][category] < compareData[1][category]
          : compareData[0][category] > compareData[1][category];
      } else if (direction === "right") {
        return isMinResult.includes(category)
          ? compareData[0][category] > compareData[1][category]
          : compareData[0][category] < compareData[1][category];
      }
    }
    return false;
  };

  // constructs individual result lines in the compare card
  const compareResultLine = (
    categoryName,
    category,
    isWinPercentage = false
  ) => {
    return (
      <Grid
        textAlign={"center"}
        alignItems={"center"}
        justifyContent={"center"}
        container
        item
        xs={12}
      >
        <Grid item xs={2}>
          <Typography variant={isWinner(category, "left") ? "h6" : "h7"}>
            {compareData[0][category] !== null
              ? formatNumber(compareData[0][category], isWinPercentage)
              : "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          {isWinner(category, "left") ? (
            <ArrowLeftSharpIcon
              sx={{ color: "success.main" }}
              fontSize="large"
            />
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="overline" fontSize={14}>
            {categoryName}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          {isWinner(category, "right") ? (
            <ArrowRightSharpIcon
              sx={{ color: "success.main" }}
              fontSize="large"
            />
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs={2}>
          <Typography variant={isWinner(category, "right") ? "h6" : "h7"}>
            {compareData[1][category] !== null
              ? formatNumber(compareData[1][category], isWinPercentage)
              : "N/A"}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  // constructs the compare card, which displays all player results
  const compareCard = () => {
    if (displayCompareCard) {
      return (
        <Grid
          marginTop={6}
          marginBottom={8}
          container
          marginX={"auto"}
          maxWidth={"md"}
          spacing={1}
        >
          {/* <Grid item xs={12}>
            <Typography textAlign={"center"} variant="h5">
              Career results
            </Typography>
          </Grid> */}
          {compareResultLine("Total games played", "total_games")}
          {compareResultLine("Career wins", "wins")}
          {compareResultLine(
            "Career winning percentage",
            "win_percentage",
            true
          )}
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

  return (
    <Container maxWidth="xl">
      <Grid
        container
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
      </Grid>

      {/* Player avatars and names */}
      <Grid container alignItems="center" justifyContent="center" marginTop={5}>
        {playerAvatar(player1, clickPlayerOne)}
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
        {playerAvatar(player2, clickPlayerTwo)}
      </Grid>

      {compareCard()}

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={top100Films}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Movie" />}
      />
    </Container>
  );

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
