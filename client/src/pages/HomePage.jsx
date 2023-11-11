import { useEffect, useState } from 'react';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function HomePage() {
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/`)
        .then((res) => res.text())
        .then((resJson) => console.log(resJson))
        .catch((err) => console.log(err));
    });

    return (
        <>
            <h1>TopSpin</h1>
        </>
    );
}