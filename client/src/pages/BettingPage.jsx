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
  Paper,
  ThemeProvider,
  FormGroup
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import * as React from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
const FLASK_PORT = 5002;
// const API_KEY = import.meta.env.VITE_BINGSEARCH_KEY;

export default function BettingPage() {

  const [results, setResults] = useState({}); // variable for results of betting strategy
  const [bettingAmount, setBettingAmount] = useState(1.0);
  const [startDate, setStartDate] = useState(dayjs('2015-01-01'));
  const [endDate, setEndDate] = useState(dayjs('2016-01-01'));
  const [useAce, setUseAce] = useState(false);
  const [useDf, setUseDf] = useState(false);
  const [useSvpt, setUseSvpt] = useState(false);
  const [use1stIn, setUse1stIn] = useState(false);
  const [use1stWon, setUse1stWon] = useState(false);
  const [use2ndWon, setUse2ndWon] = useState(false);
  const [useSvGms, setUseSvGms] = useState(false);
  const [useBpSaved, setUseBpSaved] = useState(false);
  const [useBpFaced, setUseBpFaced] = useState(false);

  const player1 = 107;
  const year1 = 2017;
  const player2 = 28;
  const year2 = 2018;

  const [p1, setPlayer1Stats] = useState({});
  const [p2, setPlayer2Stats] = useState({});
  const [matchPrediction, setMatchPrediction] = useState({});

  // function handles change of page number
  const simulateBetting = () => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/betting/statistics?` + 
      `amount=${bettingAmount}&` + 
      `start_date=${startDate.format('YYYY-MM-DD')}&` + 
      `end_date=${endDate.format('YYYY-MM-DD')}&` +
      `use_avg_ace=${useAce}&` +
      `use_avg_df=${useDf}&` +
      `use_avg_svpt=${useSvpt}&` +
      `use_avg_1stIn=${use1stIn}&` +
      `use_avg_1stWon=${use1stWon}&` +
      `use_avg_2ndWon=${use2ndWon}&` +
      `use_avg_SvGms=${useSvGms}&` +
      `use_avg_bpSaved=${useBpSaved}&` +
      `use_avg_bpFaced=${useBpFaced}`
    ) // send get request to analyze betting strategy on server
    .then((res) => res.json()) // convert response to json
    .then((resJson) => setResults(resJson)) // set results of the strategy
    .catch((err) => console.log(err)); // catch and log errors
  };

  const simulateMatch = () => {
    fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/player/${player1}/${year1}`
    )
    .then((res) => res.json())
    .then((resJson) => setPlayer1Stats(resJson))
    .catch((err) => console.log(err));

    fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/player/${player2}/${year2}`
    )
    .then((res) => res.json())
    .then((resJson) => setPlayer2Stats(resJson))
    .catch((err) => console.log(err));

    console.log(p1);
    console.log(p1.avg_ace);
    fetch(
      `http://${SERVER_HOST}:${FLASK_PORT}/predict/` +
      `${p1.avg_ace},` +
      `${p1.avg_df},` +
      `${p1.avg_svpt},` +
      `${p1.avg_1stIn},` +
      `${p1.avg_1stWon},` +
      `${p1.avg_2ndWon},` +
      `${p1.avg_SvGms},` +
      `${p1.avg_bpSaved},` +
      `${p1.avg_bpFaced},` +
      `${p2.avg_ace},` +
      `${p2.avg_df},` +
      `${p2.avg_svpt},` +
      `${p2.avg_1stIn},` +
      `${p2.avg_1stWon},` +
      `${p2.avg_2ndWon},` +
      `${p2.avg_SvGms},` +
      `${p2.avg_bpSaved},` +
      `${p2.avg_bpFaced}`
    )
    .then((res) => res.json())
    .then((resJson) => setMatchPrediction(resJson))
    .catch((err) => console.log(err));

    console.log(matchPrediction);
  };

  return (
    <Container maxWidth='xl'>
      <Grid container direction={'row'} spacing={3} justifyContent={'center'} alignItems={'center'} sx={{marginTop: 0}}>
        <Grid item xs={12}>
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
        <Grid item xs={4}>
          <TextField
            label="Bet Amount per Match"
            id="outlined-start-adornment"
            sx={{ m: 1, width: '25ch' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            value={bettingAmount}
            onChange={(event) => {
              setBettingAmount(event.target.value);
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              value={startDate} 
              onChange={(newValue) => setStartDate(newValue)}
              label="Start Date"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              value={endDate} 
              onChange={(newValue) => setEndDate(newValue)}
              label="End Date"
            />
          </LocalizationProvider>
        </Grid>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseAce(event.target.checked)}}
              />}
            label="ace"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseDf(event.target.checked)}}
              />}
            label="df"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseSvpt(event.target.checked)}}
              />}
            label="svpt"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUse1stIn(event.target.checked)}}
              />}
            label="1stIn"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUse1stWon(event.target.checked)}}
              />}
            label="1stWon"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUse2ndWon(event.target.checked)}}
              />}
            label="2ndWon"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseSvGms(event.target.checked)}}
              />}
            label="SvGms"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseBpSaved(event.target.checked)}}
              />}
            label="bpSaved"
            labelPlacement="top"
          />
          <FormControlLabel
            value="top"
            control={<Switch 
              color="primary" 
              onChange={(event) => {setUseBpFaced(event.target.checked)}}
              />}
            label="bpFaced"
            labelPlacement="top"
          />
        </FormGroup>
        <Box width="100%" mt={1}/>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={() => {simulateBetting();}}
          >Simulate</Button>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={() => {simulateMatch();}}
          >Match</Button>
        </Grid>
      </Grid>
      {JSON.stringify(results)}
    </Container>
  );
}