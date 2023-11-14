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
app.get("/", routes.home);
app.get("/player", routes.player);
app.get("/player/:id", routes.player_info);
app.get("/player/:id/stats", routes.player_stats);
app.get("/player/:id/surface", routes.player_surface);
app.get("/player/:id/matches", routes.player_matches);


// listen for requests
app.listen(`${SERVER_PORT}`, () => {
  console.log(`Topspin server listening on port ${SERVER_PORT}`);
});

module.exports = app;