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
} from "@mui/material";
import ArrowLeftRoundedIcon from "@mui/icons-material/ArrowLeftRounded";
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

// TODO check this function
const parseScores = (score) => {
  return score.split(" ");
};

export default function MatchPage() {
  const { tourney_id, match_num } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [matchData, setMatchData] = useState({}); // state var to store and update match data

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

  return (
    <>
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

          {/* displays tournament data */}
          <Card sx={{ maxWidth: "sm" }}>
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                marginTop: "5px",
                marginBottom: "20px",
              }}
              image={setMatchSurfacePath(matchData.surface)}
              title="court surface"
            />

            {/* displays match duration if available */}
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isNaN(parseInt(matchData.minutes)) ? (
                <Chip
                  label={minToDuration(parseInt(matchData.minutes))}
                  sx={{ marginX: 1 }}
                />
              ) : (
                <></>
              )}
            </CardContent>

            {/* displays match score if available */}
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {matchData.score !== null ? (
                <Chip label={matchData.score} sx={{ marginX: 1 }} />
              ) : (
                <></>
              )}
            </CardContent>

            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* player 1 results */}
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
                <Grid item xs={3}>
                  <Typography variant="body1">{matchData.score}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <ArrowLeftRoundedIcon fontSize="large" htmlColor="green" />
                </Grid>

                {/* player 2 results */}
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
                <Grid item xs={3}>
                  <Typography variant="body1">4 6 6</Typography>
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
