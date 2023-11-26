import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import ArrowLeftSharpIcon from "@mui/icons-material/ArrowLeftSharp";
import { setMatchSurfacePath, defineRound } from "../utils";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

const minToDuration = (minutes) => {
  const numHours = Math.floor(minutes / 60);
  let numMinutes = minutes % 60;
  if (numMinutes < 10) {
    numMinutes = "0" + numMinutes;
  }
  return numHours + ":" + numMinutes;
};

export default function MatchPage() {
  const { tourney_id, match_num } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [matchData, setMatchData] = useState({}); // state var to store and update match data
  const [winnerResults, setWinnerResults] = useState([]);
  const [loserResults, setLoserResults] = useState([]);

  const parseScores = (score) => {
    if (score.includes("?") || score.includes("W/O") || score.includes("RET")) {
      return;
    }

    // parse game scores
    // winner score on left, loser score on right
    const setScores = score.split(" ");
    const winnerSetScores = [];
    const loserSetScores = [];

    setScores.forEach((set) => {
      if (set.includes("-")) {
        const gameScore = set.split("-");

        const winner = truncateScore(gameScore[0].trim());
        winnerSetScores.push(winner);

        const loser = truncateScore(gameScore[1].trim());
        loserSetScores.push(loser);
      }
    });

    setWinnerResults(winnerSetScores);
    setLoserResults(loserSetScores);
  };

  const truncateScore = (score) => {
    const indexOfParenthesis = score.indexOf("(");
    return indexOfParenthesis !== -1
      ? score.substring(0, indexOfParenthesis)
      : score;
  };

  // GET req to /tournament/:tourney_id/:match_num for match data
  useEffect(() => {
    fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/tournament/${tourney_id}/${match_num}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res[0]);
        setMatchData(res[0]);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }, []); // run on initial render

  // parses scores to populate score table
  useEffect(() => {
    matchData.score ? parseScores(matchData.score) : "";
  }, [matchData]); // run when matchData changes

  return (
    <>
      {/* // TODO create loading component */}
      {isLoading ? (
        <Typography textAlign="center" variant="body2">
          LOADING
        </Typography>
      ) : (
        <Box
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          {/* displays tournament name */}
          <Typography
            sx={{ marginBottom: "20px" }}
            textAlign="center"
            variant="h4"
          >
            {matchData.name}
          </Typography>

          <Card
            sx={{
              maxWidth: "lg",
            }}
          >
            {/* displays tournament data (league, round, surface) */}
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginY: "10px",
              }}
            >
              <Chip
                label={matchData.league.toUpperCase()}
                sx={{ marginX: 1 }}
              />
              <Chip label={defineRound(matchData.round)} sx={{ marginX: 1 }} />
              <Chip label={matchData.surface} sx={{ marginX: 1 }} />
            </CardContent>

            {/* displays image of tournament surface */}
            <CardMedia
              component="img"
              sx={{
                maxWidth: 350,
                borderRadius: "8px",
                margin: "auto",
                marginBottom: "20px",
              }}
              image={setMatchSurfacePath(matchData.surface)}
              title="court surface"
            />

            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* player 1 (winner) results */}
                <Grid item xs={2}>
                  <Typography textAlign="center" variant="body2">
                    {matchData.winner_country}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography textAlign="left" variant="h5">
                    {matchData.winner_name}
                  </Typography>
                </Grid>
                <Grid
                  container
                  spacing={3}
                  sx={{ justifyContent: "right", alignItems: "right" }}
                  item
                  xs={3}
                >
                  {winnerResults.map((element, index) => (
                    <Grid item>
                      <Typography
                        display="inline"
                        key={index}
                        variant="h6"
                        sx={{
                          color:
                            element > loserResults[index] ? "white" : "grey",
                        }}
                      >
                        {element}
                      </Typography>
                    </Grid>
                  ))}
                  <Grid item xs={1}>
                    <ArrowLeftSharpIcon fontSize="large" />
                  </Grid>
                </Grid>

                {/* player 2 (loser) results */}
                <Grid item xs={2}>
                  <Typography textAlign="center" variant="body2">
                    {matchData.loser_country}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography textAlign="left" variant="h5">
                    {matchData.loser_name}
                  </Typography>
                </Grid>
                <Grid
                  container
                  spacing={3}
                  sx={{ justifyContent: "right", alignItems: "right" }}
                  item
                  xs={3}
                >
                  {loserResults.map((element, index) => (
                    <Grid item>
                      <Typography
                        display="inline"
                        key={index}
                        variant="h6"
                        sx={{
                          color:
                            element > winnerResults[index] ? "white" : "grey",
                        }}
                      >
                        {element}
                      </Typography>
                    </Grid>
                  ))}
                  <Grid item xs={1}></Grid>
                </Grid>
              </Grid>
            </CardContent>

            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button>Compare Players</Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
