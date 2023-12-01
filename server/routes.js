const mysql = require("mysql2");
const config = require("./config");
const { isValidTournament, handleResponse } = require("./utils");

// Creates MySQL connection using database credential provided in config.json
const connection = mysql.createConnection({
  host: config.HOST,
  user: config.USERNAME,
  password: config.PASSWORD,
  port: config.PORT,
  database: config.DATABASE,
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true,
});
connection.connect((err) => err && console.log(err));

const home = async (req, res) => {
  res.send("Server homepage");
};

// route that retrieves all player data
const player = async (req, res) => {
  const getCount = req.query.count === "true";
  const name = "%" + req.query.search + "%";
  const pageSize = parseInt(req.query.pageSize, 10)
    ? parseInt(req.query.pageSize, 10)
    : 20;
  const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  let league;

  // define the offset
  const offset = pageSize * (page - 1);

  // validate league param
  if (req.query.league != "wta" && req.query.league != "atp") {
    league = ["atp", "wta"];
  } else {
    league = [req.query.league];
  }

  if (getCount) {
    connection.query(
      `
      SELECT COUNT(id) AS count
      FROM player
      WHERE name LIKE ? AND league IN (?)
      `,
      [name, league],
      (err, data) => handleResponse(err, data[0] ?? data, req.path, res)
    );
  } else {
    connection.query(
      `
      SELECT id, name, ioc, league, wins 
      FROM player P INNER JOIN player_stats PS
        ON P.id=PS.player_id
      WHERE name LIKE ? AND league IN (?)
      ORDER BY wins DESC
      LIMIT ?
      OFFSET ?;
      `,
      [name, league, pageSize, offset],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

// route that retrieves a specific player's demographic
const player_info = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});

    // otherwise try execute query
  } else {
    connection.query(
      `
      SELECT * 
      FROM player
      WHERE id=?;
      `,
      [player_id],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
  }
};

// route that retrieves a specific player's best and worst match surface
const player_surface = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json([]);

    // otherwise try execute query
  } else {
    connection.query(
      `
      WITH surface_perf AS (
          WITH win_surface AS (
                            SELECT surface, COUNT(G.winner_id) AS wins
                            FROM game G INNER JOIN tournament T ON G.tourney_id=T.id
                            WHERE G.winner_id=? AND surface IS NOT NULL
                            GROUP BY surface
          ),
          loss_surface AS (
                            SELECT surface, COUNT(G.loser_id) AS losses
                            FROM game G INNER JOIN tournament T ON G.tourney_id=T.id
                            WHERE G.loser_id=? AND surface IS NOT NULL
                            GROUP BY surface
          )
          SELECT IFNULL(w_surface, l_surface) AS surface, 
                IFNULL(wins, 0) AS wins, 
                IFNULL(losses, 0) AS losses,
                IFNULL(wins,0)/(IFNULL(wins,0)+IFNULL(losses,0)) AS win_percentage,
                IFNULL(losses,0)/(IFNULL(wins,0)+IFNULL(losses,0)) AS loss_percentage
          FROM ((SELECT W.surface AS w_surface, wins, losses, L.surface AS l_surface
                FROM win_surface W LEFT JOIN loss_surface L on W.surface=L.surface)
                UNION
                (SELECT W.surface AS w_surface, wins, losses, L.surface AS l_surface
                FROM win_surface W RIGHT JOIN loss_surface L on W.surface=L.surface)) WL
      )
      SELECT *
      FROM surface_perf
      WHERE win_percentage=(SELECT MAX(win_percentage) FROM surface_perf)
        OR loss_percentage=(SELECT MAX(loss_percentage) FROM surface_perf)
      ORDER BY win_percentage DESC;
      `,
      [player_id, player_id],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

const player_winloss = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json([]);

    // otherwise try execute query
  } else {
    connection.query(
      `
      SELECT YEAR(start_date) as year,
            CAST(SUM(IF(winner_id = ?, 1, 0)) AS UNSIGNED) AS wins,
            CAST(SUM(IF(loser_id = ?, 1, 0)) AS UNSIGNED) AS losses
      FROM game INNER JOIN tournament ON game.tourney_id = tournament.id
      WHERE winner_id=? OR loser_id=?
      GROUP BY year
      ORDER BY year;
      `,
      [player_id, player_id, player_id, player_id],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

// route that retrieves a specific player's historical match stats
const player_stats = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});

    // otherwise try execute query
  } else {
    connection.query(
      `
      SELECT player_id, wins, win_percentage, losses, loss_percentage,
            total_games, avg_l_1stIn, avg_l_1stWon, avg_l_2ndWon,
            avg_l_ace, avg_l_age, avg_l_bpFaced, avg_l_bpSaved,
            avg_l_df, avg_l_minutes, avg_l_SvGms, avg_l_svpt,
            avg_w_1stIn, avg_w_1stWon, avg_w_2ndWon, avg_w_ace,
            avg_w_age, avg_w_bpFaced, avg_w_bpSaved, avg_w_df, 
            avg_w_minutes, avg_w_SvGms, avg_w_svpt
      FROM player_stats
      WHERE player_id=?;
      `,
      [player_id],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
  }
};

// route that retrieves a specific player's historical match information
const player_matches = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json([]);

    // otherwise try execute query
  } else {
    connection.query(
      `
      SELECT ROW_NUMBER() OVER(ORDER BY start_date DESC) AS id, name AS tourney_name, 
            start_date, surface, winner_name, winner_id,
            loser_name, loser_id, max_sets, score, tourney_id
      FROM tournament T
          INNER JOIN (
                      SELECT tourney_id, P1.name AS winner_name, G.winner_id,
                              P2.name AS loser_name, G.loser_id, score, max_sets
                      FROM game G INNER JOIN
                          player P1 ON G.winner_id=P1.id INNER JOIN
                          player P2 ON G.loser_id=P2.id
                      WHERE winner_id=? OR loser_id=?
          ) M
              ON T.id=M.tourney_id
      ORDER BY start_date DESC;
      `,
      [player_id, player_id],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

const single_match = async (req, res) => {
  const tourney_id = req.params.tourney_id;
  const match_num = parseInt(req.params.match_num);

  // invalid tournament id or match number
  if (!isValidTournament(tourney_id) || isNaN(match_num)) {
    console.log("Invalid req params");
    res.json([]);
    // execute query
  } else {
    connection.query(
      `
      SELECT G.tourney_id, G.match_num,
          T.name, T.surface, T.league,
          G.round, G.score,
          W.name AS winner_name, W.ioc AS winner_country, W.id AS winner_id,
          L.name AS loser_name, L.ioc AS loser_country, L.id AS loser_id
      FROM game G
          JOIN tournament T ON G.tourney_id=T.id
          JOIN player W ON G.winner_id = W.id
          JOIN player L ON G.loser_id = L.id
      WHERE G.tourney_id=? AND G.match_num=?;
      `,
      [tourney_id, match_num],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

const compare = async (req, res) => {
  const player1 = parseInt(req.params.player1);
  const player2 = parseInt(req.params.player2);

  // player ids or comparison between same player ids
  // TODO ideally, same player ids should be controlled at client level
  if (isNaN(player1) || isNaN(player2) || player1 === player2) {
    console.log("Invalid req params");
    res.json([]);
    // execute query
  } else {
    connection.query(
      `
      SELECT P.name, P.league, P.hand, P.height, S.*
      FROM player_stats S
          JOIN player P ON S.player_id = P.id
      WHERE S.player_id IN (?, ?)
      `,
      [player1, player2],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

// route that retrieves all tournament data
// TODO: current query format doesn't work. Need to do it as players
// functionality needed is a group by, with a list of all ids that fall under a given name
const tournament_home = async (req, res) => {
  connection.query(
    `
    SELECT name, league, start_date, surface, id
    FROM tournament
    ORDER BY name ASC;
    `,
    (err, data) => handleResponse(err, data, req.path, res)
  );
};

// route that retrieves all matches in a specific tournament
const tournament_select = async (req, res) => {
  const tournament_id = req.params.id;

  // if tournament_id is not provided or not a string
  if (!tournament_id) {
    res.json([]);
    // otherwise try execute query
  } else {
    connection.query(
      `
      SELECT * 
      FROM tournament t INNER JOIN game g ON t.id=g.tourney_id
      WHERE tourney_id=?
      ORDER BY g.match_num ASC;
      `,
      [tournament_id],
      (err, match_data) => handleResponse(err, match_data, req.path, res)
    );
  }
};

//TODO: combine both tournament-specific queries into one route
// promise.all? or nesting queries? Discuss best practice! -- AA
//temp route for decade.. need to build out optional decade param. ? in route not working.
const tournament_alltime = async (req, res) => {
  console.log("Params:", req.params);
  const tournament_name = req.params.name;
  const decade_start = req.params.decade ? parseInt(req.params.decade) : null;
  const decade_end = decade_start ? decade_start + 9 : null;
  console.log("Tournament name:", tournament_name);
  console.log("Decade start:", decade_start);
  let query;
  let params;

  if (!tournament_name) {
    res.json([]);
  } else {
    // if we get a decade, filter those stats
    if (decade_start !== null) {
      query = `
      (SELECT 'Most Tournament Wins' as \`role\`, g.winner_id as \`Player ID\`, p1.name as \`Record Holder\`, COUNT(*) as Victories
      FROM tournament t
      INNER JOIN game g ON t.id = g.tourney_id
      INNER JOIN player p1 ON g.winner_id = p1.id
      WHERE t.name=? AND g.round = 'F' AND YEAR(t.start_date) BETWEEN ? AND ?
      GROUP BY g.winner_id, p1.name
      ORDER BY Victories DESC
      LIMIT 1)
      
      UNION 
      
      (SELECT 'Most Losses at Final' as \`role\`, g.loser_id as \`Player ID\`, p2.name as \`Record Holder\`, COUNT(*) as Losses
      FROM tournament t2
      INNER JOIN game g ON t2.id = g.tourney_id
      INNER JOIN player p2 ON g.loser_id = p2.id
      WHERE t2.name=? AND g.round = 'F' AND YEAR(t2.start_date) BETWEEN ? AND ?
      GROUP BY g.loser_id, p2.name
      ORDER BY Losses DESC
      LIMIT 1)
      `;
      params = [
        tournament_name,
        decade_start,
        decade_end,
        tournament_name,
        decade_start,
        decade_end,
      ];
    } else {
      // else all time stats
      query = `
      (SELECT 'Most Tournament Wins' as \`role\`, g.winner_id as \`Player ID\`, p1.name as \`Record Holder\`, COUNT(*) as Victories
      FROM tournament t
      INNER JOIN game g ON t.id = g.tourney_id
      INNER JOIN player p1 ON g.winner_id = p1.id
      WHERE t.name=? AND g.round = 'F'
      GROUP BY g.winner_id, p1.name
      ORDER BY Victories DESC
      LIMIT 1)
      
      UNION 
      
      (SELECT 'Most Losses at Final' as \`role\`, g.loser_id as \`Player ID\`, p2.name as \`Record Holder\`, COUNT(*) as Losses
      FROM tournament t2
      INNER JOIN game g ON t2.id = g.tourney_id
      INNER JOIN player p2 ON g.loser_id = p2.id
      WHERE t2.name=? AND g.round = 'F'
      GROUP BY g.loser_id, p2.name
      ORDER BY Losses DESC
      LIMIT 1)
      `;
      params = [tournament_name, tournament_name];
    }
  }
  connection.query(query, params, (err, data) =>
    handleResponse(err, data, req.path, res)
  );
};

// route that retrieves all distinct tournament names and leagues
const tournament_names = async (req, res) => {
  connection.query(
    `
    SELECT 
    name,
    MAX(CASE WHEN league = 'wta' THEN 1 ELSE 0 END) AS WTA,
    MAX(CASE WHEN league = 'atp' THEN 1 ELSE 0 END) AS ATP,
    GROUP_CONCAT(DISTINCT CASE WHEN league = 'wta' THEN YEAR(start_date) END ORDER BY YEAR(start_date)) AS WTA_Years,
    GROUP_CONCAT(DISTINCT CASE WHEN league = 'atp' THEN YEAR(start_date) END ORDER BY YEAR(start_date)) AS ATP_Years
    FROM tournament
    GROUP BY name
    ORDER BY name ASC
    `,
    (err, data) => handleResponse(err, data, req.path, res)
  );
};

module.exports = {
  home,
  player,
  player_info,
  player_surface,
  player_winloss,
  player_stats,
  player_matches,
  single_match,
  compare,
  tournament_home,
  tournament_select,
  tournament_alltime,
  tournament_names,
};
