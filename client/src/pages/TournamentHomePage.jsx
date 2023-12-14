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
import { Link } from "react-router-dom";

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

  }, []); // [] empty listener, so only run effect on load of page

  // generate tournament link function
  const generateTournamentLink = (params) => {
    return (
      <Link
        href= {`/tournament/${params.row.name}/${params.row.league}/${params.row.start_date}`}
        style={{ color: "inherit", textDecoration: "none" }}
        onMouseOver={(e) => {
                    e.target.style.color = "#008000";
                    e.target.style.textDecoration = "none";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "inherit";
                    e.target.style.textDecoration = "none";
                  }}>
          {params.row.name}
      </Link>
    );
  };

  // create rows for DataGrid
  const rows = tournaments.map((tournament) => ({
    id: tournament.id,
    name:tournament.name,
    date: new Date(tournament.start_date).toLocaleDateString(),
    league: tournament.league,
    surface: tournament.surface,
    level: tournament.level,
  }));

  //create columns for all data
  const columns = [
    { field: 'name', headerName: 'Tournament Name', width: 250 , renderCell: (params) => generateTournamentLink(params) },
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

   

  return (
    <Grid container justifyContent="flex-end" spacing={4} p={4}>
      <Grid item xs={4}>
        {/* Component on Top */}
        <div style={{ height: 200, width: '100%', backgroundColor: 'lightblue' }}>
        <Carousel 
        containerStyle = {{width: "100px",height: "70px", margin: "0 auto"}}
        >
          {/* Add your images here */}
          <img src="/src/assets/imgs/th-gauff.jpg" alt="Image 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <img src="/src/assets/imgs/th-federervsdjok.jpg" alt="Image 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <img src="/src/assets/imgs/th-usopen.jpeg" alt="Image 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <img src="/src/assets/imgs/th-sillhouette.jpeg" alt="Image 4"  style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <img src="/src/assets/imgs/th-bjkvsriggs.jpg" alt="Image 5" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Carousel>
        </div>
      </Grid>
      <Grid item xs={8}>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </div>
      </Grid>
    </Grid>
  );
}

  

