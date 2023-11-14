const mysql = require('mysql2');
const config = require('./config');


// Creates MySQL connection using database credential provided in config.json
const connection = mysql.createConnection({
  host: config.HOST,
  user: config.USERNAME,
  password: config.PASSWORD,
  port: config.PORT,
  database: config.DATABASE
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
    `, (err, data) => {
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
  });
}

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
}

// route that retrieves a specific player's historical match stats
// TODO: Decide on stats to include in view and implement view
// TODO: Implement stats route
const player_stats = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});

  // otherwise try execute query
  } else {
    res.json({message:'Player Stats route successfully connected.'});

    // SELECT * FROM player_stats_view WHERE id=?;
    // connection.query(
    //   `
    //   SELECT * 
    //   FROM player
    //   WHERE id=?;
    //   `,
    //   [player_id],
    //   (err, data) => {
    //     // if error or no data was returned (id out of range), send empty json
    //     if (err || data.length === 0) {
    //       console.log(err);
    //       res.json({});
        
    //     // if query successful
    //     } else {
    //       res.json(data[0]);
    //     }
    //   }
    // );
  }
}

// route that retrieves a specific player's historical match information
// TODO: Implement matches route
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
}

module.exports = { 
  home,
  player, 
  player_info,
  player_stats,
  player_matches,
};
