import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

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
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Grid item>
          <h1>Match</h1>
        </Grid>
      </Grid>
    </>
  );
}
