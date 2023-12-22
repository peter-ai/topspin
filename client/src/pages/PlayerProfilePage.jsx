import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Container,
  Typography,
  Link,
  Box,
  Skeleton,
  Stack,
  Divider,
  Tab,
  Tabs,
  Paper,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { DataGrid } from "@mui/x-data-grid";
import SportsTennisTwoToneIcon from "@mui/icons-material/SportsTennisTwoTone";
import QueryStatsTwoToneIcon from "@mui/icons-material/QueryStatsTwoTone";
import PercentTwoToneIcon from "@mui/icons-material/PercentTwoTone";
import atp_logo_1 from "../assets/imgs/atp-silhouette-1.png";
import atp_logo_2 from "../assets/imgs/atp-silhouette-2.png";
import wta_logo_1 from "../assets/imgs/wta-silhouette-1.png";
import wta_logo_2 from "../assets/imgs/wta-silhouette-2.png";
import { getPlayerFlag, getDate, getPlayerHand, generateTableHeader, formatStatsNumber } from "../utils";

// declare server port and host for requests
const SERVER_PROTOCOL = import.meta.env.VITE_SERVER_PROTOCOL;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerProfilePage() {
  const { id } = useParams(); // get player id parameter from url

  const [tab, setTab] = useState(0); // track state of tab selection by user
  const [winElevation, setWinElevation] = useState(3);
  const [lossElevation, setLossElevation] = useState(3);

  // const [playerImages, setPlayerImages] = useState([]);
  const [playerInfo, setPlayerInfo] = useState({}); // variable for player info
  const [playerWinLoss, setPlayerWinLoss] = useState([]); // variable for historical win-loss analytics
  const [playerSurfaces, setPlayerSurfaces] = useState([]); // variable for player's best and worst match surfaces historically
  const [playerStats, setPlayerStats] = useState({}); // variable for player stats
  const [playerMatches, setPlayerMatches] = useState([]); // track changes to matches

  // use effect
  useEffect(() => {
    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/player/${id}`) // send get request to /player/:id route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setPlayerInfo(resJson)) // set player info
      .catch((err) => console.log(err)); // catch and log errors

    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/player/${id}/winloss`) // send get request to /player/:id/surface route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => {
        // if player has more than 3 years of matches fill in gaps in years with null
        if (resJson.length > 3) {
          const data = Array();
          const n = resJson.length - 1;

          let idx = 0;
          let curr_year = resJson[idx];
          data.push(curr_year);

          while (curr_year.year < resJson[n].year) {
            if (curr_year.year + 1 !== resJson[idx + 1].year) {
              curr_year = {
                year: curr_year.year + 1,
                wins: null,
                losses: null,
              };
              data.push(curr_year);
            } else {
              idx++;
              curr_year = resJson[idx];
              data.push(curr_year);
            }
          }
          setPlayerWinLoss(data);
        } else {
          setPlayerWinLoss(resJson);
        }
      })
      .catch((err) => console.log(err)); // catch and log errors

    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/player/${id}/surface`) // send get request to /player/:id/surface route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setPlayerSurfaces(resJson)) // set player surface preferences
      .catch((err) => console.log(err)); // catch and log errors

    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/player/${id}/stats`) // send get request to /player/:id/stats route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setPlayerStats(resJson)) // set player historical match stats
      .catch((err) => console.log(err)); // catch and log errors

    fetch(`${SERVER_PROTOCOL}://${SERVER_HOST}`+ (SERVER_PROTOCOL === 'http' ? `:${SERVER_PORT}` : ``) + `/api/player/${id}/matches`) // send get request to /player/:id/matches route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setPlayerMatches(resJson)) // set player matches
      .catch((err) => console.log(err)); // catch and log errors
  }, []); // [] empty listener

  // function facilitate the change of tabs
  const changeTab = (e, new_tab) => {
    setTab(new_tab);
  };

  // function to process and format player info card
  const showPlayerInfo = () => {
    if (playerInfo && Object.keys(playerInfo).length) {
      return (
        <>
          <b>League:</b> {playerInfo.league.toUpperCase()}
          <br />
          <b>Height:</b> {playerInfo.height ? playerInfo.height + " cm" : "N/A"}
          <br />
          <b>IOC:</b> {getPlayerFlag(playerInfo.ioc)}
          <br />
          <b>Dominant Hand:</b> {getPlayerHand(playerInfo.hand)}
          <br />
          <b>DOB:</b> {getDate(playerInfo.dob, "player")}
        </>
      );
    } else {
      return <Skeleton variant="rounded" width={"100%"} height={225} />;
    }
  };

  // function to process player court surface preferances based on response
  const showSurfaceStats = () => {
    if (playerSurfaces && playerSurfaces.length >= 0) {
      if (playerSurfaces.length === 2) {
        return (
          <>
            <Grid
              item
              xs={6}
              sx={{ paddingTop: "0!important", paddingLeft: "4px!important" }}
            >
              <Stack
                spacing={1}
                sx={{
                  ":hover": { color: "success.main", transition: "250ms" },
                }}
              >
                <Typography variant="body1">
                  {playerStats.wins !== null &&
                  typeof playerStats.wins !== "undefined" ? (
                    <b>
                      {playerStats.wins} career{" "}
                      {playerStats.wins === 1 ? "win" : "wins"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
                <Typography variant="body1">
                  <b>{Math.round(playerSurfaces[0].win_percentage * 100)}% </b>
                  win rate on <b>
                    {playerSurfaces[0].surface.toLowerCase()}
                  </b>{" "}
                  courts
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sx={{ paddingTop: "0!important" }}>
              <Stack
                spacing={1}
                sx={{ ":hover": { color: "error.light", transition: "250ms" } }}
              >
                <Typography variant="body1">
                  {playerStats.losses !== null &&
                  typeof playerStats.losses !== "undefined" ? (
                    <b>
                      {playerStats.losses} career{" "}
                      {playerStats.losses === 1 ? "loss" : "losses"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
                <Typography variant="body1">
                  <b>{Math.round(playerSurfaces[1].win_percentage * 100)}% </b>
                  win rate on <b>
                    {playerSurfaces[1].surface.toLowerCase()}
                  </b>{" "}
                  courts
                </Typography>
              </Stack>
            </Grid>
          </>
        );
      } else if (playerSurfaces.length === 1) {
        return (
          <>
            <Grid
              item
              xs={6}
              sx={{ paddingTop: "0!important", paddingLeft: "4px!important" }}
            >
              <Stack
                spacing={1}
                sx={{
                  ":hover": { color: "success.main", transition: "250ms" },
                }}
              >
                <Typography variant="body1">
                  {playerStats.wins !== null &&
                  typeof playerStats.wins !== "undefined" ? (
                    <b>
                      {playerStats.wins} career{" "}
                      {playerStats.wins === 1 ? "win" : "wins"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sx={{ paddingTop: "0!important" }}>
              <Stack
                spacing={1}
                sx={{ ":hover": { color: "error.light", transition: "250ms" } }}
              >
                <Typography variant="body1">
                  {playerStats.losses !== null &&
                  typeof playerStats.losses !== "undefined" ? (
                    <b>
                      {playerStats.losses} career{" "}
                      {playerStats.losses === 1 ? "loss" : "losses"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} pl={0} justifyContent={"center"}>
              <Typography variant="body1">
                <b>{Math.round(playerSurfaces[0].win_percentage * 100)}% </b>
                win rate on <b>
                  {playerSurfaces[0].surface.toLowerCase()}
                </b>{" "}
                courts
              </Typography>
            </Grid>
          </>
        );
      } else {
        return (
          <>
            <Grid
              item
              xs={6}
              sx={{ paddingTop: "0!important", paddingLeft: "4px!important" }}
            >
              <Stack
                spacing={1}
                sx={{
                  ":hover": { color: "success.main", transition: "250ms" },
                }}
              >
                <Typography variant="body1">
                  {playerStats.wins !== null &&
                  typeof playerStats.wins !== "undefined" ? (
                    <b>
                      {playerStats.wins} career{" "}
                      {playerStats.wins === 1 ? "win" : "wins"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sx={{ paddingTop: "0!important" }}>
              <Stack
                spacing={1}
                sx={{ ":hover": { color: "error.light", transition: "250ms" } }}
              >
                <Typography variant="body1">
                  {playerStats.losses !== null &&
                  typeof playerStats.losses !== "undefined" ? (
                    <b>
                      {playerStats.losses} career{" "}
                      {playerStats.losses === 1 ? "loss" : "losses"}
                    </b>
                  ) : (
                    <Skeleton variant="rounded" height={100} />
                  )}
                </Typography>
              </Stack>
            </Grid>
          </>
        );
      }
    } else {
      return (
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={100} />
        </Grid>
      );
    }
  };

  // function that defines analytics and visualizations
  const getHistoricalPerformance = () => {
    if (playerWinLoss && playerWinLoss.length !== 0) {
      if (playerWinLoss.length > 3) {
        return (
          <LineChart
            dataset={playerWinLoss}
            xAxis={[
              {
                dataKey: "year",
                valueFormatter: (y) => y.toString(),
                tickMinStep: 1,
              },
            ]}
            series={[
              {
                dataKey: "wins",
                label: "Wins",
                connectNulls: false,
                valueFormatter: (value) =>
                  value == null ? "No matches" : value.toString(),
                color: "#66bb6a",
              },
              {
                dataKey: "losses",
                label: "Losses",
                connectNulls: false,
                valueFormatter: (value) =>
                  value == null ? "No matches" : value.toString(),
                color: "#e57373",
              },
            ]}
          />
        );
      } else {
        return (
          <BarChart
            dataset={playerWinLoss}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "year",
                valueFormatter: (y) => y.toString(),
              },
            ]}
            series={[
              {
                dataKey: "wins",
                label: "Wins",
                color: "#66bb6a",
                highlightScope: {
                  highlighted: "item",
                  faded: "global",
                },
              },
              {
                dataKey: "losses",
                label: "Losses",
                color: "#e57373",
                highlightScope: {
                  highlighted: "item",
                  faded: "global",
                },
              },
            ]}
            yAxis={[{ tickMinStep: 1 }]}
          />
        );
      }
    } else {
      return <Skeleton variant="rounded" width={900} height={510} />;
    }
  };

  // function to format sport analytics/statistics cards for a given player
  const getSportAnalytics = () => {
    if (playerStats && Object.keys(playerStats).length) {
      return (
        <Grid container spacing={4} justifyContent={"center"}>
          <Grid item xs={6} justifyContent={"center"}>
            <Paper
              elevation={winElevation}
              sx={{
                transition: "transform 0.225s ease-in-out",
                ":hover": { transform: "scale3d(1.015, 1.015, 1.0)" },
              }}
              onMouseOver={() => setWinElevation(9)}
              onMouseOut={() => setWinElevation(3)}
            >
              <Stack
                spacing={2}
                width={"100%"}
                p={4}
                textAlign={"center"}
                justifyContent={"center"}
              >
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="h5">Winning Matches</Typography>
                </Box>
                <Divider
                  orientation="horizontal"
                  sx={{
                    width: "80%",
                    borderColor: "primary.main",
                    alignSelf: "center",
                  }}
                />
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.win_percentage !== null
                      ? Math.round(playerStats.win_percentage * 100) + "%"
                      : "Winning % not available"}
                  </Typography>
                  {playerStats.win_percentage !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      career winning percentage
                    </Typography>
                  ) : (
                    ""
                  )}
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Avg Duration:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_minutes !== null
                      ? Math.round(playerStats.avg_w_minutes)
                      : "N/A"}
                  </Typography>
                  {playerStats.avg_w_minutes !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      mins
                    </Typography>
                  ) : (
                    " "
                  )}

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      width: "80%",
                      borderColor: "primary.main",
                      alignSelf: "center",
                      display: "inline",
                      mr: 1,
                      ml: 1,
                    }}
                  />

                  <Typography variant="overline" display={"inline"}>
                    Avg Age:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_age !== null
                      ? Math.round(playerStats.avg_w_age)
                      : "N/A"}
                  </Typography>
                  {playerStats.avg_w_age !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      years old
                    </Typography>
                  ) : (
                    ""
                  )}
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Aces:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_ace !== null
                      ? formatStatsNumber(playerStats.avg_w_ace)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Double Faults:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_df !== null
                      ? formatStatsNumber(playerStats.avg_w_df)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Serve Points:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_svpt !== null
                      ? formatStatsNumber(playerStats.avg_w_svpt)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average First Serves Made:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_1stIn !== null
                      ? formatStatsNumber(playerStats.avg_w_1stIn)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average First-Serve Points Won:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_1stWon !== null
                      ? formatStatsNumber(playerStats.avg_w_1stWon)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Second-Serve Points Won:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_2ndWon !== null
                      ? formatStatsNumber(playerStats.avg_w_2ndWon)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Serve Games:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_SvGms !== null
                      ? formatStatsNumber(playerStats.avg_w_SvGms)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Break Points Saved:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_bpSaved !== null
                      ? formatStatsNumber(playerStats.avg_w_bpSaved)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Break Points Faced:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_w_bpFaced !== null
                      ? formatStatsNumber(playerStats.avg_w_bpFaced)
                      : "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} justifyContent={"center"}>
            <Paper
              elevation={lossElevation}
              sx={{
                transition: "transform 0.225s ease-in-out",
                ":hover": { transform: "scale3d(1.015, 1.015, 1.0)" },
              }}
              onMouseOver={() => setLossElevation(9)}
              onMouseOut={() => setLossElevation(3)}
            >
              <Stack
                spacing={2}
                width={"100%"}
                p={4}
                textAlign={"center"}
                justifyContent={"center"}
              >
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="h5">Losing Matches</Typography>
                </Box>
                <Divider
                  orientation="horizontal"
                  sx={{
                    width: "80%",
                    borderColor: "primary.main",
                    alignSelf: "center",
                  }}
                />
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.loss_percentage !== null
                      ? Math.round(playerStats.loss_percentage * 100) + "%"
                      : "Losing % not available"}
                  </Typography>
                  {playerStats.loss_percentage !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      career losing percentage
                    </Typography>
                  ) : (
                    ""
                  )}
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Avg Duration:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_minutes !== null
                      ? Math.round(playerStats.avg_l_minutes)
                      : "N/A"}
                  </Typography>
                  {playerStats.avg_l_minutes !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      mins
                    </Typography>
                  ) : (
                    " "
                  )}

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      width: "80%",
                      borderColor: "primary.main",
                      alignSelf: "center",
                      display: "inline",
                      mr: 1,
                      ml: 1,
                    }}
                  />

                  <Typography variant="overline" display={"inline"}>
                    Avg Age:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_age !== null
                      ? Math.round(playerStats.avg_l_age)
                      : "N/A"}
                  </Typography>
                  {playerStats.avg_l_age !== null ? (
                    <Typography variant="overline" display={"inline"}>
                      {" "}
                      years old
                    </Typography>
                  ) : (
                    ""
                  )}
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Aces:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_ace !== null
                      ? formatStatsNumber(playerStats.avg_l_ace)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Double Faults:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_df !== null
                      ? formatStatsNumber(playerStats.avg_l_df)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Serve Points:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_svpt !== null
                      ? formatStatsNumber(playerStats.avg_l_svpt)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average First Serves Made:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_1stIn !== null
                      ? formatStatsNumber(playerStats.avg_l_1stIn)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average First-Serve Points Won:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_1stWon !== null
                      ? formatStatsNumber(playerStats.avg_l_1stWon)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Second-Serve Points Won:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_2ndWon !== null
                      ? formatStatsNumber(playerStats.avg_l_2ndWon)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Serve Games:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_SvGms !== null
                      ? formatStatsNumber(playerStats.avg_l_SvGms)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Break Points Saved:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_bpSaved !== null
                      ? formatStatsNumber(playerStats.avg_l_bpSaved)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box width={"100%"} textAlign={"center"}>
                  <Typography variant="overline" display={"inline"}>
                    Average Break Points Faced:{" "}
                  </Typography>
                  <Typography variant="h6" display={"inline"}>
                    {playerStats.avg_l_bpFaced !== null
                      ? formatStatsNumber(playerStats.avg_l_bpFaced)
                      : "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid container spacing={4} justifyContent={"center"}>
          <Grid item xs={6} justifyContent={"center"}>
            <Skeleton variant="rounded" width={"100%"} height={525} />
          </Grid>
          <Grid item xs={6} justifyContent={"center"}>
            <Skeleton variant="rounded" width={"100%"} height={525} />
          </Grid>
        </Grid>
      );
    }
  };

  // function to format player text as hyperlink for match table
  const generatePlayerLink = (params, athlete) => {
    const name = params.value;

    if (name !== playerInfo.name) {
      const loc = params.id - 1;
      const player_id =
        athlete === "winner"
          ? playerMatches[loc].winner_id
          : playerMatches[loc].loser_id;
      return (
        <Link
          href={"/player/" + player_id}
          underline="none"
          target="_blank"
          rel="noopener"
          sx={{
            ":hover": {
              color: "success.main",
              transition: "250ms",
            },
          }}
        >
          {name}
        </Link>
      );
    } else {
      return name;
    }
  };

  // function to format tournament text as hyperlink for match table
  const generateTournamentLink = (params) => {
    const loc = params.id - 1;
    return (
      <Link
        href={"/tournament/" + playerMatches[loc].tourney_name + '/' + playerInfo.league + '/' + playerMatches[loc].start_date.slice(0,10)}
        underline="none"
        target="_blank"
        rel="noopener"
        sx={{
          ":hover": {
            color: "success.main",
            transition: "250ms",
          },
        }}
      >
        {params.value}
      </Link>
    );
  };

  // function to format matches as a data table
  const getMatches = () => {
    if (playerMatches && playerMatches.length) {
      const cols = [
        {
          field: "tourney_name",
          headerName: "Tournament",
          flex: 1.5,
          renderHeader: (params) => generateTableHeader(params),
          renderCell: (params) => generateTournamentLink(params),
          description: "CH indicates Challenger circuit",
        },
        {
          field: "start_date",
          headerName: "Start Date",
          flex: 1,
          type: "date",
          renderHeader: (params) => generateTableHeader(params),
          valueGetter: (params) => getDate(params.row.start_date, "tournament"),
        },
        {
          field: "surface",
          headerName: "Surface",
          flex: 1,
          renderHeader: (params) => generateTableHeader(params),
        },
        {
          field: "winner_name",
          headerName: "Winner",
          flex: 1.5,
          renderHeader: (params) => generateTableHeader(params),
          renderCell: (params) => generatePlayerLink(params, "winner"),
        },
        {
          field: "loser_name",
          headerName: "Loser",
          flex: 1.5,
          renderHeader: (params) => generateTableHeader(params),
          renderCell: (params) => generatePlayerLink(params, "loser"),
        },
        {
          field: "max_sets",
          headerName: "Sets",
          flex: 0.75,
          renderHeader: (params) => generateTableHeader(params),
          description: "Maximum sets played",
        },
        {
          field: "score",
          headerName: "Score",
          flex: 2,
          renderHeader: (params) => generateTableHeader(params),
        },
      ];

      return (
        <DataGrid
          rows={playerMatches}
          columns={cols}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 12 },
            },
          }}
          pageSizeOptions={[12, 25, 50]}
          density="compact"
        />
      );
    } else {
      return <Skeleton variant="rounded" height={525} width={"100%"} />;
    }
  };

  // function to render the content for each tab
  const renderTabContent = (tab_num) => {
    if (tab_num === 0) {
      return getHistoricalPerformance();
    }
    if (tab_num === 1) {
      return getSportAnalytics();
    }
    if (tab_num === 2) {
      return getMatches();
    }
  };

  

  return (
    <Container maxWidth="xl">
      <Grid
        container
        direction={"row"}
        spacing={3}
        alignItems={"flex-start"}
        sx={{ marginTop: 0 }}
      >
        <Grid
          item
          xs={3}
          sx={{ textAlign: "center" }}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {playerInfo && Object.keys(playerInfo).length ? (
            <Box
              component="img"
              sx={{
                width: "90%",
                borderRadius: "50%",
                border: 3,
                borderColor: "primary.main",
              }}
              alt={
                playerInfo.name && playerInfo.league
                  ? playerInfo.name +
                    " " +
                    playerInfo.league +
                    " tennis player silhouette"
                  : ""
              }
              src={
                playerInfo.league === "atp"
                  ? id % 2
                    ? atp_logo_1
                    : atp_logo_2
                  : id % 2
                  ? wta_logo_1
                  : wta_logo_2
              }
            />
          ) : (
            <Skeleton
              variant="circular"
              width={250}
              height={250}
              sx={{ margin: "auto" }}
            />
          )}
          <Typography variant="h4">
            {playerInfo && Object.keys(playerInfo).length ? (
              playerInfo.name
            ) : (
              <Skeleton />
            )}
          </Typography>
          <Stack
            alignItems={"center"}
            justifyContent={"center"}
            divider={
              <Divider
                orientation="horizontal"
                sx={{ width: "100%", borderColor: "primary.main" }}
              />
            }
            spacing={2}
            mt={1}
          >
            <Typography variant="body1" width={"100%"}>
              {showPlayerInfo()}
            </Typography>
            <Grid
              container
              spacing={1}
              justifyContent={"center"}
              alignItems={"center"}
              pb={2}
            >
              {showSurfaceStats()}
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={9}>
          <Tabs
            value={tab}
            onChange={changeTab}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              icon={<QueryStatsTwoToneIcon />}
              label="Historical Performance"
              value={0}
            />
            <Tab
              icon={<PercentTwoToneIcon />}
              label="Sport Analytics"
              value={1}
            />
            <Tab icon={<SportsTennisTwoToneIcon />} label="Matches" value={2} />
          </Tabs>
          <Box width={"97%"} height={tab === 0 ? 530 : "100%"} m={2}>
            {renderTabContent(tab)}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
