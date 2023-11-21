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
  const numHours = Math.floor(minutes / 60);
  const numMinutes = minutes % 60;
  if (numMinutes < 10) {
    numMinutes = "0" + numMinutes;
  }
  return numHours + ":" + numMinutes;
};

const setMatchSurfacePath = (surface) => {
  switch (surface) {
    case "Grass":
      return "/src/assets/imgs/grass-tennis-court.png";
    case "Clay":
      return "/src/assets/imgs/clay-tennis-court.png";
    case "Hard":
      return "/src/assets/imgs/hard-tennis-court.png";
    case "Carpet":
      return "/src/assets/imgs/carpet-tennis-court.png";
    default:
      return "/src/assets/imgs/carpet-tennis-court.png";
  }
};

const defineRound = (round) => {
  switch (round) {
    case "R32":
      return "Round of 32";
    case "R16":
      return "Round of 16";
    case "QF":
      return "Quarterfinals";
    case "SF":
      return "Semifinals";
    case "F":
      return "Finals";
    case "R64":
      return "Round of 64";
    case "CR":
      return "Consolation Round";
    case "PR":
      return "Play-off Round";
    case "R128":
      return "Round of 128";
    case "RR":
      return "Round Robin";
    case "BR":
      return "Bronze Medal Match";
    case "ER":
      return "Early Rounds";
    case "Q1":
    case "Q2":
    case "Q3":
    case "Q4":
      return "Qualifying Rounds";
    default:
      return "Match";
  }
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
            <Chip label={matchData.league.toUpperCase()} sx={{ marginX: 1 }} />
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
    </>
  );
}

// <>
//       <Box
//         height="100vh"
//         display="flex"
//         flexDirection="column"
//         justifyContent="center"
//         alignItems="center"
//       >
//         <Typography
//           sx={{ marginBottom: "20px" }}
//           textAlign="center"
//           variant="h2"
//         >
//           Match
//         </Typography>
//         <Card sx={{ maxWidth: "sm" }}>
//           <CardMedia
//             component="img"
//             sx={{
//               maxWidth: 350,
//               borderRadius: "8px",
//               margin: "auto",
//               marginY: "20px",
//             }}
//             image="/src/assets/imgs/clay-tennis-court.png"
//             title="court surface"
//           />

//           <CardContent
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Chip
//               label={minToDuration(matchData.minutes)}
//               sx={{ marginX: 1 }}
//             />
//             <Chip label={matchData.round} sx={{ marginX: 1 }} />
//             <Chip label={matchData.surface} sx={{ marginX: 1 }} />
//           </CardContent>

//           <CardContent>
//             <Grid container alignItems="center" spacing={2}>
//               {/* player 1 results */}
//               <Grid item xs={2}>
//                 <Typography textAlign="center" variant="body2">
//                   {matchData.winner_country}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6}>
//                 <Typography textAlign="left" variant="h5">
//                   {matchData.winner_name}
//                 </Typography>
//               </Grid>
//               <Grid item xs={3}>
//                 <Typography variant="body1">{matchData.score}</Typography>
//               </Grid>
//               <Grid item xs={1}>
//                 <ArrowLeftRoundedIcon fontSize="large" htmlColor="green" />
//               </Grid>

//               {/* player 2 results */}
//               <Grid item xs={2}>
//                 <Typography textAlign="center" variant="body2">
//                   {matchData.loser_country}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6}>
//                 <Typography textAlign="left" variant="h5">
//                   {matchData.loser_name}
//                 </Typography>
//               </Grid>
//               <Grid item xs={3}>
//                 <Typography variant="body1">4 6 6</Typography>
//               </Grid>
//               <Grid item xs={1}></Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Box>
//     </>

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
