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
 * TODO api routes should be prepended with api (I didn't make the change on other
 * TODO routes so as not to break any existing frontend components that call the server)
 */
app.get("/", routes.home);
app.get("/api/player", routes.player);
app.get("/api/player/:id", routes.player_info);
app.get("/api/player/:id/stats", routes.player_stats);
app.get("/api/player/:id/surface", routes.player_surface);
app.get("/api/player/:id/matches", routes.player_matches);
app.get("/api/tournament/:tourney_id/:match_num", routes.single_match);
app.get("/api/compare/:player1/:player2", routes.compare);
app.get("/api/tournament", routes.tournament_home);
app.get("/api/tournament/:id", routes.tournament_select);
app.get("/api/tournament/stats/:name/:decade", routes.tournament_alltime);

// listen for requests
const server = app.listen(`${SERVER_PORT}`, () => {
  console.log(`Topspin server listening on port ${SERVER_PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
});

module.exports = app;
