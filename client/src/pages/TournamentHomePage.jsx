import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Button,
  Stack,
  Pagination,
} from "@mui/material";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
  const [tournaments, setTournaments] = useState([]); // variable for list of tournaments
  const [uniqueTouramentNames, setTournamentNames] = useState([]);

  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament`) // send get request to /tournament route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setTournaments(resJson)) // set tournaments
      .catch((err) => console.log(err)); // catch and log errors

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournamentnames`) // send get request to /tournamentnames route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setTournamentNames(resJson)) // set tournaments
      .catch((err) => console.log(err)); // catch and log errors
  }, []); // [] empty listener, so only run effect on load of page

  // /api/tournament/:name/:league/:date



 
  
}


 

  /*
  return (
    <div style={{ maxWidth: "800px", maxHeight: "400px", margin: "auto" }}>
      <Carousel
      //IndicatorIcon={numbersArray}
      autoPlay={false} 
      >
        {uniqueTouramentNames.map((tournament, i) => (
          <Item key={i} item={tournament} />
        ))}
      </Carousel>
    </div>
  );

  function Item(props) {
    return (
      <Paper>
        <h2>{props.item.name}</h2>
        <p>{props.item.WTA ? "Yes" : "No"}</p>
        <p>{props.item.ATP ? "Yes" : "No"}</p>

        <Button className="CheckButton">Check it out!</Button>
      </Paper>
    );
  }
    
    */
