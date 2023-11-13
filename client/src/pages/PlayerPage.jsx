import { useEffect, useState } from 'react';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TestPage() {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player`)
        .then((res) => res.json())
        .then((resJson) => {
            console.log(resJson);
            setPlayers(resJson);
        })
        .catch((err) => console.log(err));
    }, []);

    


    return (
        <>
            <h1>Players</h1>
            <h3>Check console to verify data test successful</h3>
            <ul>
                {
                    players.map((player) => (
                        <li key={player.id}>
                            <a href={'/player/'+player.id}>{player.name}</a>: {player.ioc} | {player.league}
                        </li>
                    ))
                }
            </ul>
        </>
    );
}