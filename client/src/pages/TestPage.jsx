import { useEffect, useState } from 'react';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function TestPage() {
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/test`)
        .then((res) => res.json())
        .then((resJson) => console.log("Success:", resJson))
        .catch((err) => console.log(err));
    }, []);


    return (
        <>
            <h1>TestPage</h1>
            <h3>Check console to verify data test successful</h3>
        </>
    );
}