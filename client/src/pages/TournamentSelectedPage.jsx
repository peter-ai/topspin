import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Carousel from "react-material-ui-carousel";
import {
  Card,
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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { setMatchSurfacePath, defineRound, getPlayerFlag, getDate } from "../utils";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TournamentPage() {
  const { id } = useParams(); // route parameters for tournament id
  const [matches, setTournamentMatches] = useState([]); //all matches for a given tournament id
  const [tournament, setTournamentData] = useState([]); //tournament level data for a given tournament id
  const [decade_stats, setTournamentDecadeStats] = useState([]); //all matches for a given tournament id

  // use effect to send GET req to /tournament/:id for tournament data, and decade stats
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        setTournamentMatches(resJson);
      })
      .catch((err) => console.log(err));

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        setTournamentData(resJson);
      })
      .catch((err) => console.log(err));

    /*  fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament/stats/${tournament[0].name}/2013`)
      .then((res) => res.json())
      .then((resJson) => {
        setTournamentDecadeStats(resJson);
      })
      .catch((err) => console.log(err));
      */
  }, []); // run on initial render

  // temp instead of loading state
  const tournament_title =
    tournament.length > 0
      ? `${tournament[0].name} ${
          tournament[0].year
        }: ${tournament[0].league.toUpperCase()}`
      : "Loading...";

  const tournament_surface =
    tournament.length > 0 ? tournament[0].surface : "Loading...";

  const tournament_winner =
    matches.length > 0 ? matches[0].winner : "Loading...";

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
            style={{ maxWidth: "20%", borderRadius: '10px' }}
          />
        </div>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
        <div
          style={{
            width: "150px",
            margin: "auto",
          }}
        >
          <Card
            style={{
              backgroundColor: "rgba(160, 160, 160, 0.8)",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              maxHeight: '20%'
            }}
          >
            <EmojiEventsIcon
              style={{
                fontSize: "50px",
                color: "#ffd700", // Customize the color if needed
                marginBottom: "1px",
              }}
            />
            <CardContent>
              <Typography variant="h6">{tournament[0].year} Winner</Typography>
              <Typography variant="body1">{tournament_winner}</Typography>
            </CardContent>
          </Card>
        </div>
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
          <TableContainer component={Paper} style={{ borderRadius: "10px" }}>
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
                          e.target.style.textDecoration = "none";
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
