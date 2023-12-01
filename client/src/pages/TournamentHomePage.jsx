import { useEffect, useState } from 'react';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
    const [tournament, setTournaments] = useState([]); // variable for list of tournaments
    
    // use effect
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/tournament`) // send get request to /tournament route on server
        .then((res) => res.json()) // convert response to json
        .then((resJson) => setTournaments(resJson)) // set tournaments 
        .catch((err) => console.log(err)); // catch and log errors
    }, []); // [] empty listener, so only run effect on load of page

    // handles change of league dropdown
    const handleChange = (e) => {
        e.preventDefault();
        setLeagueInput(e.target.value);
    }
    
    // function to set state of search bar
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchInput(e.target.value); // set variable to the current value of search bar
    };
      
    // function to output players based on matching search results for player names and specified league
    const searchPlayers = () => {
        return players.filter((player) => {
            return (
                (leagueInput === 'Both' || player.league === leagueInput.toLowerCase()) && // if league is Both or player league matches input league
                player.name.toLowerCase().includes(searchInput.toLowerCase()) // if player name includes the search string, empty str matches true for all
            )
        }).map((player) => (
            // construct list of players to display
            <li key={player.id}>
                <a href={'/player/'+player.id}>{player.name}</a>: {player.ioc} | {player.league}
            </li>
        ));
    };

    return (
        <>
            <h1>Players</h1>
            <label htmlFor='league'>League: </label>

            <select name='league' id='league' value={leagueInput} onChange={handleChange}>
                <option value='Both'>Both</option>
                <option value='WTA'>Women's (WTA)</option>
                <option value='ATP'>Men's (ATP)</option>
            </select>

            <input
                type="search"
                placeholder="Search by name"
                onChange={handleSearch}
                value={searchInput} 
            />            
            <ul>
                {searchPlayers()}
            </ul>
        </>
    );
}