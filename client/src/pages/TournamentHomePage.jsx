import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Grid,
  Popover,
  Tooltip,
  IconButton,
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
  Skeleton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import InfoIcon from "@mui/icons-material/Info";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TournamentHomePage() {
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

  //create columns for all data
  const columns = [
    { field: 'name', headerName: 'Tournament Name', width: 250 },
    { field: 'league', headerName: 'League', width: 100 },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'surface', headerName: 'Surface', width: 150 },
    { field: 'level', headerName: (
      <Tooltip title=" Levels refer to the type of tournament, including prize money or format. For more information, see our sidebar.
      " arrow>
        <div>
          Level <InfoIcon style={{ fontSize: 16, verticalAlign: 'middle' }} />
        </div>
      </Tooltip>
    ),
    width: 200,
  },
  ];

   // create rows for DataGrid
   const rows = tournaments.map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    date: new Date(tournament.start_date).toLocaleDateString(),
    league: tournament.league,
    surface: tournament.surface,
    level: tournament.level,
  }));

  return (
    <Grid container justifyContent="flex-end" spacing={4} p={4}>
      <Grid item xs={8}>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            checkboxSelection
            disableSelectionOnClick
          />
        </div>
      </Grid>
      {/* Additional content can be added here */}
    </Grid>
  );
}

  
