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
        .then(resJson => {
            console.log(resJson)
            setPlayerInfo(resJson)
        }) // set player
        .catch(err => console.log(err)); // catch and log errors

        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}/surface`) // send get request to /player/:id/surface route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => {
            console.log(resJson)
        }) // set player surface preferences
        .catch(err => console.log(err)); // catch and log errors

        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}/stats`) // send get request to /player/:id/stats route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => {
            console.log(resJson)
            setPlayerStats(resJson)
        }) // set player historical match stats
        .catch(err => console.log(err)); // catch and log errors

        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}/matches`) // send get request to /player/:id/matches route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => {
            console.log(resJson)
            setPlayerMatches(resJson)
        }) // set player matches
        .catch(err => console.log(err)); // catch and log errors
    }, []) // [] empty listener, so only run effect on load of page

    // TODO: Player card and info to the left (1/4 columns)
    // TODO: Player stats to the right split by wins/losses/overall (3/4 columns)
    // TODO: Player matches in filterable table ordered by most recent match underneath stats or in swappable tab (3/4 columns)
    return (
        <>
            <h1>{playerInfo.name}</h1>
            <h5>See console to check success of requests to other routes</h5>
        </>
    );
}
