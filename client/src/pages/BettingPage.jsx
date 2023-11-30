import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Paper
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { DataGrid } from '@mui/x-data-grid';
import SportsTennisTwoToneIcon from '@mui/icons-material/SportsTennisTwoTone';
import QueryStatsTwoToneIcon from '@mui/icons-material/QueryStatsTwoTone';
import PercentTwoToneIcon from '@mui/icons-material/PercentTwoTone';
import atp_logo_1 from '../public/atp-silhouette-1.png';
import atp_logo_2 from '../public/atp-silhouette-2.png';
import wta_logo_1 from '../public/wta-silhouette-1.png';
import wta_logo_2 from '../public/wta-silhouette-2.png';
import { getPlayerFlag, getDate, getPlayerHand } from '../component/utils';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
// const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

export default function BettingPage() {

  const [results, setResults] = useState({}); // variable for results of betting strategy
  const [bettingAmount] = useState(1.0);
  const [startDate] = useState('2015-01-01');
  const [endDate] = useState('2016-01-01');
  const [useAvgAce] = useState(true);

  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/betting/statistics?` + 
      `amount=${bettingAmount}&` + 
      `start_date=${startDate}&` + 
      `end_date=${endDate}&` +
      `use_avg_ace=${useAvgAce}`
    ) // send get request to analyze betting strategy on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setResults(resJson)) // set results of the strategy
    .catch((err) => console.log(err)); // catch and log errors
  }, []);

  console.log(results);

  return (
    <Container maxWidth='xl'>
      <Grid container direction={'row'} spacing={3} justifyContent={'center'} alignItems={'center'} sx={{marginTop: 0}}>
        <Grid item xs={6}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 300,
              letterSpacing: '.2rem',
            }}
            gutterBottom
          >
            Betting Strategy Analysis
          </Typography>
        </Grid>
        
        <Box width="100%" mt={1}/>
      </Grid>
      {JSON.stringify(results)}
    </Container>
  );
}