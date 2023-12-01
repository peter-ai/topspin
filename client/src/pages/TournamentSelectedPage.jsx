import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Carousel from "react-material-ui-carousel";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Button,
  Container,
  Link,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { setMatchSurfacePath, defineRound } from "../utils";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TournamentPage() {
  const { id } = useParams(); // route parameters for tournament id
  const [matches, setTournamentMatches] = useState([]); //all matches for a given tournament id
  const [decade_stats, setTournamentDecadeStats] = useState([]); //all matches for a given tournament id

  // use effect to send GET req to /tournament/:id for tournament data, and decade stats
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        setTournamentMatches(resJson);
      })
      .catch((err) => console.log(err));
  }, []); // run on initial render

  // temp instead of loading state
  const tournament_title =
    matches.length > 0
      ? `${matches[0].name} ${
          matches[0].year
        }: ${matches[0].league.toUpperCase()}`
      : "Loading...";

  const tournament_surface =
    matches.length > 0 ? matches[0].surface : "Loading...";

  const tournament_winner =
    matches.length > 0 ? matches[0].winner : "Loading...";

  // use effect to populate score table by parsing match scores in match data

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div style={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            {tournament_title}
          </Typography>
          <img
            src={setMatchSurfacePath(tournament_surface)}
            alt={`Surface: ${tournament_surface}`}
            style={{ maxWidth: "20%" }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 100,
              letterSpacing: ".2rem",
            }}
          >
            Stats
          </Typography>
        </div>
        <Grid item xs={8}>
         
        </Grid>
        <div style={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 100,
              letterSpacing: ".2rem",
            }}
          >
            Matches
          </Typography>
        </div>
      </Grid>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={5}>
          <TableContainer component={Paper}>
            <Table
              sx={{
                minWidth: 300,
                borderCollapse: "separate",
                borderSpacing: "0 6px",
              }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", borderBottom: "2px solid #ddd" }}
                  >
                    Round
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", borderBottom: "2px solid #ddd" }}
                  >
                    Matchup
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.match_num}>
                    <TableCell component="th" scope="row">
                      {defineRound(match.round)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/tournament/${id}/${match.match_num}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onMouseOver={(e) => {
                          e.target.style.color = "#008000";
                          e.target.style.textDecoration = "underline";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.color = "inherit";
                          e.target.style.textDecoration = "none";
                        }}
                      >
                        {match.winner} vs {match.loser}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Grid>
  );
}

/*

<Grid container spacing={2}>

      <Grid item xs={12}>
        <div style={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              letterSpacing: ".2rem",
            }}
            gutterBottom
          >
            Your Centered Title
          </Typography>
          <img
            src="your-image-url.jpg"
            alt="Your Image"
            style={{ maxWidth: "100%" }}
          />
        </div>
      </Grid>


      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Column 1</TableCell>
                <TableCell>Column 2</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              <TableRow>
                <TableCell>Data 1</TableCell>
                <TableCell>Data 2</TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>



     <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Dessert (100g serving)</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Fat&nbsp;(g)</TableCell>
                <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                <TableCell align="right">Protein&nbsp;(g)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.calories}</TableCell>
                  <TableCell align="right">{row.fat}</TableCell>
                  <TableCell align="right">{row.carbs}</TableCell>
                  <TableCell align="right">{row.protein}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

    */
