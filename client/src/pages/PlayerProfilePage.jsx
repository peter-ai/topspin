import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerProfilePage() {
    const { id } = useParams();

    const [player, setPlayer] = useState({}); // track player

    // use effect
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player/${id}`) // send get request to /player/:id route on server
        .then(res => res.json()) // convert response to json
        .then(resJson => console.log(resJson))//setPlayer(resJson)) // set player
        .catch(); // catch and log errors
    }, []) // [] empty listener, so only run effect on load of page



    return (
        <>
            <h1>Player ID: {id}</h1>
        </>
    );
}
