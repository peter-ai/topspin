import { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel'
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
    const [tournaments, setTournaments] = useState([]); // variable for list of tournaments
    
    // use effect
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament`) // send get request to /tournament route on server
        .then((res) => res.json()) // convert response to json
        .then((resJson) => setTournaments(resJson)) // set tournaments 
        .catch((err) => console.log(err)); // catch and log errors
    }, []); // [] empty listener, so only run effect on load of page
        /*
        // Render a Carousel component for each tournament
        const renderCarousels = () => {
            return tournament.map((tournament) => (
                <Carousel
                    key={tournament.id}
                    next={() => handleNext(tournament)}
                    prev={() => handlePrev(tournament)}
                >
                    <div>
                        <h2>{tournament.name}</h2>
                        <p>Date: {tournament.date}</p>
                        <p>Location: {tournament.location}</p>
                    </div>
                </Carousel>
            ));
        };
    
        // Handle next button click
        const handleNext = (tournament) => {
            console.log(`Next button clicked for tournament: ${tournament.name}`);
            // Add logic for what should happen when the next button is clicked
        };
    
        // Handle prev button click
        const handlePrev = (tournament) => {
            console.log(`Prev button clicked for tournament: ${tournament.name}`);
            // Add logic for what should happen when the prev button is clicked
        }; */
    
        return (
            <>
            <h1>Tournaments</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>League</th>
                  <th>Start Date</th>
                  <th>Surface</th>
                  {/* Add more headers as needed */}
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => (
                  <tr key={tournament.id}>
                    <td>{tournament.name}</td>
                    <td>{tournament.league}</td>
                    <td>{tournament.start_date}</td>
                    <td>{tournament.surface}</td>
                    {/* Add more cells as needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
}
