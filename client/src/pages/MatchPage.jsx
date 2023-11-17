import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
      .then((res) => setMatchData(res[0]))
      .catch((err) => console.log(err));
  }, []); // run on initial render

  return (
    <>
      <h1>Match</h1>
      {matchData ? (
        <div>
          <h2>{matchData.name}</h2>
          <h2>{matchData.score}</h2>
          <p>
            W: {matchData.winner_name} from {matchData.winner_country}
          </p>
          <p>
            L: {matchData.loser_name} from {matchData.loser_country}
          </p>
        </div>
      ) : (
        <p>No data found for this match.</p>
      )}
    </>
  );
}
