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

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

const minToDuration = (minutes) => {
  const minAsNum = parseInt(minutes);
  const numHours = minAsNum / 60;
  const numMinutes = minAsNum % 60;
  if (numMinutes < 10) {
    numMinutes = "0" + numMinutes;
  }
  return numHours + ":" + numMinutes;
};

export default function MatchPage() {
  const { tourney_id, match_num } = useParams();
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
      })
      .catch((err) => console.log(err));
  }, []); // run on initial render

  return (
    <>
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Card sx={{ maxWidth: "sm" }}>
          <CardMedia
            component="img"
            sx={{
              maxWidth: 350,
              borderRadius: "8px",
              margin: "auto",
              marginY: "20px",
            }}
            image="/src/assets/imgs/clay-tennis-court.png"
            title="court surface"
          />

          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Chip label="1:15" sx={{ marginX: 1 }} />
            <Chip label="QF" sx={{ marginX: 1 }} />
            <Chip label="Clay" sx={{ marginX: 1 }} />
          </CardContent>

          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              {/* player 1 results */}
              <Grid item xs={2}>
                <Typography textAlign="center" variant="body2">
                  SER
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography textAlign="left" variant="h5">
                  Novak Djokovic
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">4 6 6</Typography>
              </Grid>
              <Grid item xs={1}>
                <ArrowLeftRoundedIcon fontSize="large" htmlColor="green" />
              </Grid>

              {/* player 2 results */}
              <Grid item xs={2}>
                <Typography textAlign="center" variant="body2">
                  SER
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography textAlign="left" variant="h5">
                  Novak Djokovic
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
    </>
  );
}

// {matchData ? (
//   <div>
//     <h2>{matchData.name}</h2>
//     <h2>{matchData.score}</h2>
//     <p>
//       W: {matchData.winner_name} from {matchData.winner_country}
//     </p>
//     <p>
//       L: {matchData.loser_name} from {matchData.loser_country}
//     </p>
//   </div>
// ) : (
//   <p>No data found for this match.</p>
// )}
