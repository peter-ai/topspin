import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Container,
  Avatar,
  Badge,
  Autocomplete,
  TextField,
  FormControl,
  createFilterOptions,
  Fade,
} from "@mui/material";
import { useParams } from "react-router-dom";
import ArrowLeftSharpIcon from "@mui/icons-material/ArrowLeftSharp";
import ArrowRightSharpIcon from "@mui/icons-material/ArrowRightSharp";
import AddIcon from "@mui/icons-material/Add";
import atp_logo_1 from "../assets/imgs/atp-silhouette-1.png";
import atp_logo_2 from "../assets/imgs/atp-silhouette-2.png";
import wta_logo_1 from "../assets/imgs/wta-silhouette-1.png";
import wta_logo_2 from "../assets/imgs/wta-silhouette-2.png";

// declare server port and host for requests
const SERVER_PROTOCOL = import.meta.env.VITE_SERVER_PROTOCOL;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function ComparePage() {
  const { league, player1Name, player1Id, player2Name, player2Id } =
    useParams(); // route parameters for tournament id and match number

  const OPTIONS_LIMIT = 250; // number of players to show in autocomplete list

  // initial state objects for player 1 and player 2 (default name is Player 1 and Player 2, ids are null)
  const [player1, setPlayer1] = useState({
    name: player1Name ? player1Name : "Player 1",
    id: player1Id ? player1Id : null,
    src: league ? (league === "atp" ? atp_logo_1 : wta_logo_1) : "",
  });
  const [player2, setPlayer2] = useState({
    name: player2Name ? player2Name : "Player 2",
    id: player2Id ? player2Id : null,
    src: league ? (league === "atp" ? atp_logo_2 : wta_logo_2) : "",
  });
  const [compareData, setCompareData] = useState([]);
  const [displayCompareCard, setDisplayCompareCard] = useState(false);
  const [player1List, setPlayer1List] = useState([]); // players that match filters
  const [player2List, setPlayer2List] = useState([]); // players that match filters
  const [displayPlayer1Form, setDisplayPlayer1Form] = useState(false);
  const [displayPlayer2Form, setDisplayPlayer2Form] = useState(false);
  const [isSamePlayer, setIsSamePlayer] = useState(false);

  const fixOrderOfCompareData = (res) => {
    const buildCompareData = [];
    if (res[0].player_id == player1.id) {
      buildCompareData.push(res[0]);
      buildCompareData.push(res[1]);
    } else {
      buildCompareData.push(res[1]);
      buildCompareData.push(res[0]);
    }
    setCompareData(buildCompareData);
  };

  // GET req to /compare/:player1/:player2 to compare two selected players
  useEffect(() => {
    if (player1.id && player2.id) {
      if (player1.id != player2.id) {
        fetch(
          `${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/compare/${player1.id}/${player2.id}`
        )
          .then((res) => res.json())
          .then((res) => {
            fixOrderOfCompareData(res);
          })
          .catch((err) => console.log(err));
      } else {
        setIsSamePlayer(true);
      }
    }
  }, [player1, player2]); // runs when a change is made to either player, but a non-null id must be present for both

  // retrieves new list of players whenever the league filter is toggled
  useEffect(() => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/simulation/2023/both`)
      .then((res) => res.json())
      .then((resJson) => {
        setPlayer1List(resJson);
        setPlayer2List(resJson);
      })
      .catch((err) => console.log(err));
  }, [player1, player2]);

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
  const getPlayerSrc = (league, id) => {
    return league === "atp"
      ? id % 2
        ? atp_logo_1
        : atp_logo_2
      : id % 2
      ? wta_logo_1
      : wta_logo_2;
  };

  const clickPlayerOne = () => {
    setDisplayPlayer1Form(true);
  };

  const clickPlayerTwo = () => {
    setDisplayPlayer2Form(true);
  };

  // function sets the filter option for the autocomplete dropdown and restricts number of players
  // VISIBLE to the user within the search to OPTIONS_LIMIT
  const filterOptions = createFilterOptions({
    limit: OPTIONS_LIMIT,
  });

  const processPlayer1Selection = ({ e = null, id = null, value }) => {
    if (id) {
      setIsSamePlayer(false);
      setDisplayPlayer1Form(false);
      if (displayCompareCard) {
        setDisplayCompareCard(false);
      }
      setPlayer1({
        name: value.label,
        id: value.id,
        src: getPlayerSrc(value.league, value.id),
      });
    }
  };

  const selectPlayer1Form = () => {
    if (displayPlayer1Form) {
      return (
        <Grid
          item
          direction="column"
          container
          xs={3.5}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          <FormControl sx={{ width: "60%" }}>
            <Autocomplete
              filterOptions={filterOptions}
              size="small"
              disablePortal
              id="player1"
              options={player1List}
              getOptionKey={(option) => option.id}
              renderInput={(params) => (
                <TextField {...params} label="Player 1" color="success" />
              )}
              onChange={(e, value) =>
                processPlayer1Selection({
                  id: "player1",
                  value: value,
                })
              }
            />
          </FormControl>
        </Grid>
      );
    }
    return (
      <Grid
        item
        direction="column"
        container
        xs={3.5}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
      ></Grid>
    );
  };

  const processPlayer2Selection = ({ e = null, id = null, value }) => {
    if (id) {
      setIsSamePlayer(false);
      setDisplayPlayer2Form(false);
      if (displayCompareCard) {
        setDisplayCompareCard(false);
      }
      setPlayer2({
        name: value.label,
        id: value.id,
        src: getPlayerSrc(value.league, value.id),
      });
    }
  };

  const selectPlayer2Form = () => {
    if (displayPlayer2Form) {
      return (
        <Grid
          item
          direction="column"
          container
          xs={3.5}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          <FormControl sx={{ width: "60%" }}>
            <Autocomplete
              filterOptions={filterOptions}
              size="small"
              disablePortal
              id="player2"
              options={player2List}
              getOptionKey={(option) => option.id}
              renderInput={(params) => (
                <TextField {...params} label="Player 2" color="success" />
              )}
              onChange={(e, value) =>
                processPlayer2Selection({
                  id: "player2",
                  value: value,
                })
              }
            />
          </FormControl>
        </Grid>
      );
    }
    return (
      <Grid
        item
        direction="column"
        container
        xs={3.5}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
      ></Grid>
    );
  };

  // constructs the player avatar, which can be clicked to select a player
  const playerAvatar = (player, clickPlayer) => {
    return (
      <Grid item container xs={2} justifyContent={"center"}>
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

  // alerts if same player has been selected
  const samePlayerAlert = () => {
    if (isSamePlayer) {
      return (
        <Grid
          marginTop={6}
          item
          container
          marginX={"auto"}
          maxWidth={"md"}
          justifyContent={"center"}
        >
          <Fade in timeout={1000}>
            <Typography color={"warning.light"} textAlign="center" variant="h6">
              The same athlete has been selected. Please select two different
              players to view results.
            </Typography>
          </Fade>
        </Grid>
      );
    }
  };

  // constructs the compare card, which displays all player results
  const compareCard = () => {
    if (displayCompareCard) {
      return (
        <Fade in timeout={200}>
          <Grid
            marginTop={6}
            marginBottom={8}
            container
            marginX={"auto"}
            maxWidth={"md"}
            spacing={1}
          >
            {compareResultLine("Total matches played", "total_games")}
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
        </Fade>
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
        <Grid item xs={4}>
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
        <Grid item xs={8}>
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
        {selectPlayer1Form()}
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
        {selectPlayer2Form()}
      </Grid>

      {samePlayerAlert()}

      {compareCard()}
    </Container>
  );
}
