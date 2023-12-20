import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Button,
  Container,
  Link,
} from "@mui/material";
import ArrowLeftSharpIcon from "@mui/icons-material/ArrowLeftSharp";
import { setMatchSurfacePath, defineRound } from "../utils";
import { lookup } from "country-data";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function MatchPage() {
  const { tourney_id, match_num } = useParams(); // route parameters for tournament id and match number
  const [isLoading, setIsLoading] = useState(true); // variable tracking page load state
  const [matchData, setMatchData] = useState({}); // variable tracking match data for selected match
  const [winnerResults, setWinnerResults] = useState([]); // variable tracking scores for winner's sets
  const [loserResults, setLoserResults] = useState([]); // variable tracking scores for loser's sets

  // function to parse
  const parseScores = (score) => {
    // handles matches with no score available or walkover matches (match forfeit)
    if (score.includes("?") || score.includes("W/O")) {
      return;
    }

    // split results by set
    const setScores = score.split(" ");
    // local variables to append scores to (don't want to append to state variables since this will trigger re-render)
    const winnerSetScores = [];
    const loserSetScores = [];

    // add each set score to corresponding array
    setScores.forEach((set) => {
      if (set.includes("-")) {
        // in data, winner score is to the left of the hyphen, loser score to the right
        const gameScore = set.split("-");

        const winner = truncateScore(gameScore[0].trim());
        winnerSetScores.push(winner);

        const loser = truncateScore(gameScore[1].trim());
        loserSetScores.push(loser);
      }
    });

    // update state variables
    setWinnerResults(winnerSetScores);
    setLoserResults(loserSetScores);
  };

  // function removes all tiebreaker metrics from final score (not displayed on UI)
  const truncateScore = (score) => {
    const indexOfParenthesis = score.indexOf("(");
    return indexOfParenthesis !== -1
      ? score.substring(0, indexOfParenthesis)
      : score;
  };

  // function that handles getting the country and flag of players
  const getFlag = (player_ioc) => {
    // if ioc is UNK or null return N/A
    if (!player_ioc || player_ioc === "UNK") {
      return player_ioc;
    }

    // define list of unmatched country codes
    const unmatched = {
      AHO: "Netherlands Antilles",
      CAR: "Carribean/West Indies",
      URS: "Soviet Union (USSR)",
      FRG: "West Germany",
      GDR: "East Germany",
      TCH: "Czechoslovakia",
    };

    // check if ioc country code is list of unmatched
    if (unmatched[player_ioc]) {
      return unmatched[player_ioc];
    }

    // attempt lookup of ioc country code
    let country = lookup.countries({ ioc: player_ioc });
    if (!country.length) {
      // if unsuccessful attempt lookup of alpha-3 ISO code
      country = lookup.countries({ alpha3: player_ioc });
      if (!country.length) {
        // if unsuccessful return N/A
        return player_ioc;
      }
    }

    if (country[0]["emoji"]) {
      // if country has emoji return emoji with country name
      return country[0]["emoji"];
    } else {
      // otherwise return country abbreviation
      return player_ioc;
    }
  };

  // use effect to send GET req to /tournament/:tourney_id/:match_num for match data
  useEffect(() => {
    fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/tournament/${tourney_id}/${match_num}`
    )
      .then((res) => res.json())
      .then((res) => {
        setMatchData(res[0]);
        setIsLoading(false); // if match data is successfully retrieved, set loading state to false
      })
      .catch((err) => console.log(err));
  }, []); // run on initial render

  // use effect to populate score table by parsing match scores in match data
  useEffect(() => {
    matchData.score ? parseScores(matchData.score) : "";
  }, [matchData]); // triggered when matchData changes (should only occur after GET req on page load returns value)

  return (
    <>
      {/* // TODO create loading component */}
      {isLoading ? (
        <Typography textAlign="center" variant="body2">
          LOADING
        </Typography>
      ) : (
        <Container maxWidth="md" sx={{mb: 5}}>
          {/* displays tournament name */}
          <Typography
            sx={{
              marginTop: "40px",
              marginBottom: "20px",
              letterSpacing: ".2rem",
            }}
            textAlign="center"
            variant="h2"
          >
            {matchData.name}
          </Typography>

          <Card
            sx={{
              transition: "transform 0.225s ease-in-out",
              ":hover": { transform: "scale3d(1.015, 1.015, 1.0)" },
            }}
          >
            {/* displays tournament round */}
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginY: "10px",
              }}
            >
              <Typography textAlign="center" variant="h5">
                {defineRound(matchData.round)}
              </Typography>
            </CardContent>

            {/* displays image of tournament surface */}
            <CardMedia
              component="img"
              sx={{
                maxWidth: 350,
                borderRadius: "8px",
                margin: "auto",
              }}
              image={setMatchSurfacePath(matchData.surface)}
              title="court surface"
            />

            {/* displays tournament surface */}
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Chip
                variant="outlined"
                label={matchData.surface}
                sx={{ marginX: 1, fontSize: "15px" }}
              />
            </CardContent>

            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* player 1 (winner) results */}
                <Grid item xs={2}>
                  <Typography textAlign="center" variant="h4">
                    {getFlag(matchData.winner_country)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    textAlign="left"
                    variant="h5"
                    sx={{
                      letterSpacing: ".1rem",
                    }}
                  >
                    <Link
                      href={"/player/" + matchData.winner_id}
                      underline="none"
                      rel="noopener"
                      sx={{
                        ":hover": {
                          color: "success.main",
                          transition: "250ms",
                        },
                      }}
                    >
                      {matchData.winner_name}
                    </Link>
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
                    <Grid item key={'w-'+index.toString()}>
                      <Typography
                        display="inline"
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
                  <Typography textAlign="center" variant="h4">
                    {getFlag(matchData.loser_country)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    textAlign="left"
                    variant="h5"
                    sx={{
                      letterSpacing: ".1rem",
                    }}
                  >
                    <Link
                      href={"/player/" + matchData.loser_id}
                      underline="none"
                      rel="noopener"
                      sx={{
                        ":hover": {
                          color: "error.light",
                          transition: "250ms",
                        },
                      }}
                    >
                      {matchData.loser_name}
                    </Link>
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
                    <Grid item key={'l-'+index.toString()}>
                      <Typography
                        display="inline"
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
              <Link
                href={`/compare/${matchData.league}/${matchData.winner_name}/${matchData.winner_id}/
                                  ${matchData.loser_name}/${matchData.loser_id}`}
                underline="none"
                rel="noopener"
                sx={{
                  ":hover": {
                    color: "error.light",
                    transition: "250ms",
                  },
                }}
              >
                <Button>Compare Players</Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
}
