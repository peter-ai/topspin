import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerProfilePage() {
    const { id } = useParams();

    const [playerInfo, setPlayerInfo] = useState({}); // variable for player info
    const [playerStats, setPlayerStats] = useState({}); // variable for player stats
    const [playerMatches, setPlayerMatches] = useState([]); // track changes to matches

    // use effect
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}`) // send get request to /player/:id route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => setPlayerInfo(resJson)) // set player
        .catch(err => console.log(err)); // catch and log errors

        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}/stats`) // send get request to /player/:id/stats route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => console.log(resJson)) // [...]
        .catch(err => console.log(err)); // catch and log errors

        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}/matches`) // send get request to /player/:id/matches route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => console.log(resJson)) // [...]
        .catch(err => console.log(err)); // catch and log errors
    }, []) // [] empty listener, so only run effect on load of page



    return (
        <>
            <h1>{playerInfo.name}</h1>
            <h5>See console to check success of requests to other routes</h5>
        </>
    );
}
