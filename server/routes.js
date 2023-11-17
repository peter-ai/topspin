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
});
connection.connect((err) => err && console.log(err));

const home = async (req, res) => {
  res.send("Server homepage");
};

// route that retrieves all player data
// TODO: Cache this query
const player = async (req, res) => {
  connection.query(
    `
    SELECT id, name, ioc, league 
    FROM player;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);

        // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
        // return type you may need to return an empty array [] instead.
        res.json([]);
      } else {
        // Here, we return results of the query as an object
        res.json(data);
      }
    }
  );
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
      (err, data) => {
        // if error or no data was returned (id out of range), send empty json
        if (err || data.length === 0) {
          console.log(err);
          res.json({});

          // if query successful
        } else {
          res.json(data[0]);
        }
      }
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
                            WHERE G.winner_id=?
                            GROUP BY surface
          ),
          loss_surface AS (
                            SELECT surface, COUNT(G.loser_id) AS losses
                            FROM game G INNER JOIN tournament T ON G.tourney_id=T.id
                            WHERE G.loser_id=?
                            GROUP BY surface
          )
          SELECT w_surface AS surface, IFNULL(wins, 0) AS wins, IFNULL(losses, 0) AS losses,
                IFNULL(wins,0)/(IFNULL(wins,0)+IFNULL(losses,0)) AS win_percentage,
                IFNULL(losses,0)/(IFNULL(wins,0)+IFNULL(losses,0)) AS loss_percentage
          FROM ((SELECT W.surface AS w_surface, wins, losses, L.surface AS L_surface
                FROM win_surface W LEFT JOIN loss_surface L on W.surface=L.surface)
                UNION
                (SELECT W.surface AS w_surface, wins, losses, L.surface AS L_surface
                FROM win_surface W RIGHT JOIN loss_surface L on W.surface=L.surface)) WL
      )
      SELECT *
      FROM surface_perf
      WHERE win_percentage=(SELECT MAX(win_percentage) FROM surface_perf)
        OR loss_percentage=(SELECT MAX(loss_percentage) FROM surface_perf)
      ORDER BY win_percentage DESC;
      `,
      [player_id, player_id],
      (err, data) => {
        // if error or no data was returned (id out of range), send empty json
        if (err || data.length === 0) {
          console.log(err);
          res.json([]);

          // if query successful
        } else {
          res.json(data);
        }
      }
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
      SELECT * 
      FROM player_stats
      WHERE player_id=?;
      `,
      [player_id],
      (err, data) => {
        // if error or no data was returned (id out of range), send empty json
        if (err || data.length === 0) {
          console.log(err);
          res.json({});

          // if query successful
        } else {
          res.json(data[0]);
        }
      }
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
      SELECT tourney_id, name AS tourney_name, start_date,
            surface, draw_size, tourney_level, winner_name,
            loser_name, score, max_sets
      FROM tournament T
          INNER JOIN (
                      SELECT tourney_id, P1.name AS winner_name, 
                              P2.name AS loser_name, score, max_sets
                      FROM game G INNER JOIN
                          player P1 ON G.winner_id=P1.id INNER JOIN
                          player P2 ON G.loser_id=P2.id
                      WHERE winner_id=? OR loser_id=?
          ) M
              ON T.id=M.tourney_id
      ORDER BY start_date DESC;
      `,
      [player_id, player_id],
      (err, data) => {
        // if error or no data was returned (id out of range), send empty json
        if (err || data.length === 0) {
          console.log(err);
          res.json([]);

          // if query successful
        } else {
          res.json(data);
        }
      }
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
              T.name, T.surface,
              G.round, G.minutes, G.score,
              W.name AS winner_name, W.ioc AS winner_country,
              L.name as loser_name, L.ioc as loser_country
      FROM game G JOIN tournament T ON G.tourney_id=T.id
                  JOIN player W on G.winner_id = W.id
                  JOIN player L on G.loser_id = L.id
      WHERE G.tourney_id=? AND G.match_num=?
      `,
      [tourney_id, match_num],
      (err, data) => handleResponse(err, data, req.path, res)
    );
  }
};

module.exports = {
  home,
  player,
  player_info,
  player_surface,
  player_stats,
  player_matches,
  single_match,
};
