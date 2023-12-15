import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Grid,
  Tooltip,
  Box,
  Link,
  Skeleton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import InfoIcon from "@mui/icons-material/Info";
import { getDate, generateTableHeader } from "../utils";
import img1 from "../assets/imgs/th-gauff.jpg";
import img2 from "../assets/imgs/th-federervsdjok.jpg";
import img3 from "../assets/imgs/th-usopen.jpeg";
import img4 from "../assets/imgs/th-sillhouette.jpeg";
import img5 from "../assets/imgs/th-bjkvsriggs.jpg";

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TournamentHomePage() {
  const [tournaments, setTournaments] = useState([]); // variable for list of tournaments
  const images = [img1, img2, img3, img4, img5]; // array of images for carousel

  // use effect
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament`) // send get request to /tournament route on server
      .then((res) => res.json()) // convert response to json
      .then((resJson) => setTournaments(resJson)) // set tournaments
      .catch((err) => console.log(err)); // catch and log errors

  }, []); // [] empty listener, so only run effect on load of page

  // generate tournament link function
  const generateTournamentLink = (params) => {
    //const date = (params.row.start_date).date
    const path = `/tournament/${params.row.name}/${params.row.league}/${params.row.date.slice(0,10)}`

    return (
      <Link
        href={path}
        underline="none"
        sx={{
          ":hover": {
            color: "success.main",
            transition: "250ms",
          },
        }}
        rel="noopener"
      >
          {params.row.name}
      </Link>
    );
  };

  // create rows for DataGrid
  const rows = tournaments.map((tournament) => ({
    id: tournament.id,
    name:tournament.name,
    date: tournament.start_date,
    league: tournament.league,
    surface: tournament.surface,
    level: tournament.level,
  }));

  //create columns for all data
  const columns = [
    { field: 'name', headerName: 'Tournament Name', flex:2.5, renderHeader: (params) => generateTableHeader(params), renderCell: (params) => generateTournamentLink(params) },
    { field: 'league', headerName: 'League', flex: 1.5, renderHeader: (params) => generateTableHeader(params), renderCell: (params) => params.value.toUpperCase()},
    { field: 'date', headerName: 'Date', type:'date', flex: 1.5,renderHeader: (params) => generateTableHeader(params), valueGetter: (params) => getDate(params.row.date, "tournament") },
    { field: 'surface', headerName: 'Surface', flex: 1.5, renderHeader: (params) => generateTableHeader(params),  },
    { field: 'level', headerName: (
      <Tooltip title=" Levels refer to the type of tournament, including prize money or format. For more information, see our sidebar.
      " arrow>
        <div>
          Level <InfoIcon style={{ fontSize: 16, verticalAlign: 'middle' }} />
        </div>
      </Tooltip>
    ),
    flex: 2,
    renderHeader: (params) => generateTableHeader(params), 
  },
  ];

  return (
    <Grid container justifyContent="flex-end" spacing={4} p={4}>
      <Grid item xs={4}>
        <Box  height={ 300 } width={ '100%' } style={{ backgroundColor: 'black' }}>
          {
            tournaments.length & images.length === 5
            ? 
            (
              <Carousel 
                height={300}  
              >
                <img src={ images[0] } alt="Image 1" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5}} />
                <img src={ images[1] } alt="Image 2" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5}}/>
                <img src={ images[2] } alt="Image 3" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5 }}/>
                <img src={ images[3] } alt="Image 4"  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5 }}/>
                <img src={ images[4] } alt="Image 5" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5 }} /> 
              </Carousel>
            )
            : 
            (<Skeleton variant="rounded" width="100%" height={300} />)
            }
        </Box>
      </Grid>
      <Grid item xs={8}>
        <Box height={ 500 } width={ '100%' }>
          {tournaments.length ? (<DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />): (<Skeleton variant= 'rounded' width = '100%' height = {500} />)}
        </Box>
      </Grid>
    </Grid>
  );
}

  

