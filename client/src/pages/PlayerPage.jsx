import { useEffect, useState } from 'react';

// declare server port and host for requests
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;

export default function PlayerPage() {
    const [players, setPlayers] = useState([]); // variable for list of players
    const [searchInput, setSearchInput] = useState(''); // variable tracking state of search bar
    const [leagueInput, setLeagueInput] = useState('Both');
    
    // use effect
    useEffect(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/player`) // send get request on /player route on server
        .then((res) => res.json()) // convert response to json
        .then((resJson) => setPlayers(resJson)) // set players 
        .catch((err) => console.log(err));
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
      
    // function to output players based on matching search results for player names
    const searchPlayers = () => {
        // if length of search input is > 0 filter results
        if (searchInput.length > 0) {
            return players.filter((player) => {
                // filter based on player name
                return player.name.toLowerCase().includes(searchInput.toLowerCase())
            }).map((player) => (
                // construct list of players to display
                <li key={player.id}>
                    <a href={'/player/'+player.id}>{player.name}</a>: {player.ioc} | {player.league}
                </li>
            ));
        } else {
            // display all players
            return players.map((player) => (
                <li key={player.id}>
                    <a href={'/player/'+player.id}>{player.name}</a>: {player.ioc} | {player.league}
                </li>
            ));
        }
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