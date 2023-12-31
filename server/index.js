const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { SERVER_PORT } = require("./config");

// express app
const app = express();

// middleware
app.use(helmet()); // protect tech stack
app.use(cors()); // allow client requests
app.use(morgan("tiny")); // logger

// routes
/**
 *  API routes should be prepended with api
 */
app.get("/api", routes.home);
app.get("/api/player", routes.player);
app.get("/api/player/:id", routes.player_info);
app.get("/api/player/:id/winloss", routes.player_winloss);
app.get("/api/player/:id/stats", routes.player_stats);
app.get("/api/player/:id/surface", routes.player_surface);
app.get("/api/player/:id/matches", routes.player_matches);
app.get("/api/player/:id/:year", routes.player_average_stats);
app.get("/api/tournament/:tourney_id/:match_num", routes.single_match);
app.get("/api/compare/:player1/:player2", routes.compare);
app.get("/api/tournament", routes.tournament_home);
app.get("/api/tournamentnames", routes.tournament_names);
app.get("/api/tournament/find/:name/:league/:date", routes.tournament_select);
app.get("/api/tournament/stats/:name/:decade/:league", routes.tournament_alltime);
app.get("/api/tournament/:name/:league/:date", routes.getmatches);
app.get("/api/simulation/:year/:league", routes.eligible_players);
app.get("/api/simulation/:player1_id/:player2_id/:year", routes.simulate_match);
app.get("/api/betting/favorite", routes.betting_favorite);
app.get("/api/betting/statistics", routes.betting_statistics);
app.get("/api/betting/ml/:w_id/:l_id/:year", routes.betting_ml);
app.get("/api/match/results", routes.match_results);


// listen for requests
const server = app.listen(`${SERVER_PORT}`, () => {
  console.log(`Topspin server listening on port ${SERVER_PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
});

module.exports = app;
