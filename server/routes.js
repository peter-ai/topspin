const { getConnection, isValidTournament, handleResponse } = require("./utils");

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

  const connection = getConnection();
  if (getCount) {
    connection.query(
      `
      SELECT COUNT(id) AS count
      FROM player
      WHERE name LIKE ? AND league IN (?)
      `,
      [name, league],
      (err, data) => handleResponse(err, data, req.path, res, false)
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
  connection.end();
};

// route that retrieves a specific player's demographic
const player_info = async (req, res) => {
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});

    // otherwise try execute query
  } else {
    const connection = getConnection();
    connection.query(
      `
      SELECT * 
      FROM player
      WHERE id=?;
      `,
      [player_id],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
    connection.end();
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
    const connection = getConnection();
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
    connection.end();
  }
};

const player_winloss = async (req, res) => {
  // get player id
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json([]);

    // otherwise try execute query
  } else {
    const connection = getConnection();
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
    connection.end();
  }
};

// route that retrieves a specific player's historical match stats
const player_stats = async (req, res) => {
  // get player id
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});

    // otherwise try execute query
  } else {
    const connection = getConnection();
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
    connection.end();
  }
};

// route that retrieves a specific player's historical match information
const player_matches = async (req, res) => {
  // get player id
  const player_id = parseInt(req.params.id);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json([]);

    // otherwise try execute query
  } else {
    const connection = getConnection();
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
    connection.end();
  }
};

// route that retrieves a specific player's historical match stats
const player_average_stats = async (req, res) => {
  // get player id and year for stats
  const player_id = parseInt(req.params.id);
  const year = parseInt(req.params.year);

  // if player_id is not an integer, send empty json
  if (isNaN(player_id)) {
    res.json({});
  } else if (isNaN(year)) {
    res.json({});
  } else {
    const connection = getConnection();
    connection.query(
      `
      SELECT
        SUM(minutes)/SUM(nmatches) as avg_minutes,
        SUM(ace)/SUM(nmatches) as avg_ace,
        SUM(df)/SUM(nmatches) as avg_df,
        SUM(svpt)/SUM(nmatches) as avg_svpt,
        SUM(1stIn)/SUM(nmatches) as avg_1stIn,
        SUM(1stWon)/SUM(nmatches) as avg_1stWon,
        SUM(2ndWon)/SUM(nmatches) as avg_2ndWon,
        SUM(SvGms)/SUM(nmatches) as avg_SvGms,
        SUM(bpSaved)/SUM(nmatches) as avg_bpSaved,
        SUM(bpFaced)/SUM(nmatches) as avg_bpFaced
      FROM player_stats_yearly
      WHERE id=?
      AND year < ?
      `,
      [player_id, year],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
    connection.end();
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
    const connection = getConnection();
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
    connection.end();
  }
};

const compare = async (req, res) => {
  const player1 = parseInt(req.params.player1);
  const player2 = parseInt(req.params.player2);

  // player ids or comparison between same player ids
  if (isNaN(player1) || isNaN(player2)) {
    console.log("Invalid req params");
    res.json([]);
    // execute query
  } else {
    const connection = getConnection();
    connection.query(
      `
      SELECT P.name, S.player_id, S.wins, S.win_percentage, S.total_games,
          S.avg_ovr_1stIn, S.avg_ovr_1stWon, S.avg_ovr_2ndWon,
          S.avg_ovr_ace, S.avg_ovr_bpFaced, S.avg_ovr_bpSaved,
          S.avg_ovr_df, S.avg_ovr_SvGms, S.avg_ovr_svpt
      FROM player_stats S
          JOIN player P ON S.player_id = P.id
      WHERE S.player_id IN (?, ?)
      `,
      [player1, player2],
      (err, data) => handleResponse(err, data, req.path, res)
    );
    connection.end();
  }
};

// route that retrieves all tournament data
const tournament_home = async (req, res) => {
  const connection = getConnection();
  connection.query(
    `
    SELECT name, league, start_date, surface, id, tourney_level as level
    FROM tournament
    ORDER BY name ASC, start_date DESC, league DESC;
    `,
    (err, data) => handleResponse(err, data, req.path, res)
  );
  connection.end();
};

// route that finds the tournament id given alternate keys
const tournament_select = async (req, res) => {
  const tournament_name = req.params.name;
  const tournament_league = req.params.league;
  const tournament_date = req.params.date


  // if tournament_id is not provided or not a string
  if (!tournament_name || !tournament_league || !tournament_date ) {
    res.json([]);
    // otherwise try execute query
  } else {
    const connection = getConnection();
    connection.query(
      `
      SELECT id, surface
      FROM tournament
      WHERE name =? AND league =? AND start_date = ?
      `,
      
      [tournament_name,tournament_league, tournament_date],
      (err, data) => handleResponse(err, data, req.path, res)
    );
    connection.end();
  }
};

const tournament_alltime = async (req, res) => {
  const tournament_name = req.params.name;
  const decade_start = req.params.decade !== 'all' ? Math.round(parseInt(req.params.decade/10))*10 : -1;
  const decade_end = decade_start ? decade_start + 9 : null;
  const league = req.params.league !== 'both'? req.params.league : '%'
  let query;
  let params;

  if (!tournament_name) {
    res.json([]);
  } else {
    // if we get a decade, filter those stats
    if (decade_start !== -1) {
      query = `
      (SELECT 'Most Tournament Wins' as role, g.winner_id as player_id, p1.name as record_holder, COUNT(*) as Record
      FROM tournament t
      INNER JOIN game g ON t.id = g.tourney_id
      INNER JOIN player p1 ON g.winner_id = p1.id
      WHERE t.name=? AND g.round = 'F' AND YEAR(t.start_date) BETWEEN ? AND ? AND t.league = ?
      GROUP BY g.winner_id, p1.name
      ORDER BY Record DESC
      LIMIT 1)
      
      UNION 
      
      (SELECT 'Most Losses at Final' as role, g.loser_id as player_id, p2.name as record_holder, COUNT(*) as Record
      FROM tournament t2
      INNER JOIN game g ON t2.id = g.tourney_id
      INNER JOIN player p2 ON g.loser_id = p2.id
      WHERE t2.name=? AND g.round = 'F' AND YEAR(t2.start_date) BETWEEN ? AND ? AND t2.league =?
      GROUP BY g.loser_id, p2.name
      ORDER BY Record DESC
      LIMIT 1)
      `;
      params = [
        tournament_name,
        decade_start,
        decade_end,
        league,
        tournament_name,
        decade_start,
        decade_end,
        league
      ];
    } else {
      // else all time stats
      query = `
      (SELECT 'Most Tournament Wins' as role, g.winner_id as player_id, p1.name as record_holder, COUNT(*) as Record
      FROM tournament t
      INNER JOIN game g ON t.id = g.tourney_id
      INNER JOIN player p1 ON g.winner_id = p1.id
      WHERE t.name=? AND g.round = 'F'
      GROUP BY g.winner_id, p1.name
      ORDER BY Record DESC
      LIMIT 1)
      
      UNION 
      
      (SELECT 'Most Losses at Final' as role, g.loser_id as player_id, p2.name as record_holder, COUNT(*) as Record
      FROM tournament t2
      INNER JOIN game g ON t2.id = g.tourney_id
      INNER JOIN player p2 ON g.loser_id = p2.id
      WHERE t2.name=? AND g.round = 'F'
      GROUP BY g.loser_id, p2.name
      ORDER BY Record DESC
      LIMIT 1)
      `;
      params = [tournament_name, tournament_name];
    }
  }
  const connection = getConnection();
  connection.query(query, params, (err, data) =>
    handleResponse(err, data, req.path, res)
  );
  connection.end();
};

// route that retrieves all distinct tournament names, with league and year info
const tournament_names = async (req, res) => {
  const connection = getConnection();
  connection.query(
    `
    SELECT 
    name,
    MAX(CASE WHEN league = 'wta' THEN 1 ELSE 0 END) AS WTA,
    MAX(CASE WHEN league = 'atp' THEN 1 ELSE 0 END) AS ATP,
    GROUP_CONCAT(DISTINCT CASE WHEN league = 'wta' THEN YEAR(start_date) END ORDER BY YEAR(start_date)) AS WTA_Years,
    GROUP_CONCAT(DISTINCT CASE WHEN league = 'atp' THEN YEAR(start_date) END ORDER BY YEAR(start_date)) AS ATP_Years,
    surface
    FROM tournament
    GROUP BY name
    ORDER BY name ASC
    `,
    (err, data) => handleResponse(err, data, req.path, res)
  );
  connection.end();
};

// route that retrieves all distinct tournament names, with league and year info 
const getmatches = async (req, res) => {
  const tournament_name = req.params.name;
  const tournament_league = req.params.league;
  const tournament_date = req.params.date

  // if tournament_id is not provided or not a string
  if (!tournament_name || !tournament_league || !tournament_date ) {
    res.json([]);
    // otherwise try execute query
  } else {
    const connection = getConnection();
    connection.query(
      `
      WITH TID As(
      SELECT id, surface
      FROM tournament
      WHERE name =? AND league =? AND start_date = ?)
      SELECT TID.id as id, match_num, round, p1.name as winner, p2.name as loser, p1.id as winnerID, p2.id as loserID, surface
      FROM TID INNER JOIN game g ON TID.id=g.tourney_id INNER JOIN player p1 ON g.winner_id=p1.id INNER JOIN
      player p2 ON g.loser_id=p2.id
      ORDER BY g.match_num DESC;
      `,
      
      [tournament_name,tournament_league, tournament_date],
      (err, data) => handleResponse(err, data, req.path, res)
    );
    connection.end();
  }
};

// simulates betting the favorite as a strategy
const betting_favorite = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const betting_amount = parseFloat(req.query.amount);

  if (isNaN(betting_amount)) {
    res.json([]);
  } else {
    const connection = getConnection();
    connection.query(
      `
      WITH valid_odds AS (
        SELECT AvgW, AvgL
        FROM odds
        JOIN tournament ON odds.tourney_id = tournament.id
        WHERE tournament.start_date >= ?
        AND tournament.start_date <= ?
      ) # betting odds of all matches given the query params
      SELECT
          (SELECT COUNT(*) FROM valid_odds) as NumMatches,
          COUNT(NULLIF(AvgW,0)) as NumCorrect,
          ? * (SELECT COUNT(*) FROM valid_odds) as AmountBet,
          ? * SUM(AvgW) as AmountWon,
          ((? * SUM(AvgW)) - (? * (SELECT COUNT(*) FROM valid_odds)))/(? * (SELECT COUNT(*) FROM valid_odds)) as ROI
      FROM valid_odds
      WHERE AvgW < AvgL; # matches where the favorite won
      `,
      [
        start_date, 
        end_date, 
        betting_amount, 
        betting_amount, 
        betting_amount, 
        betting_amount, 
        betting_amount
      ],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
    connection.end();
  }
};

// simulates betting using a statistic comparison as a strategy
const betting_statistics = async (req, res) => {
  // date range of for simulation
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // amount of money to bet per match
  const betting_amount = parseFloat(req.query.amount);

  // flags denoting whether or not to use this statistic as a determining factor for betting
  const use_avg_ace = req.query.use_avg_ace === "true" ? 1 : 0;
  const use_avg_df = req.query.use_avg_df === "true" ? 1 : 0;
  const use_avg_svpt = req.query.use_avg_svpt === "true" ? 1 : 0;
  const use_avg_1stIn = req.query.use_avg_1stIn === "true" ? 1 : 0;
  const use_avg_1stWon = req.query.use_avg_1stWon === "true" ? 1 : 0;
  const use_avg_2ndWon = req.query.use_avg_2ndWon === "true" ? 1 : 0;
  const use_avg_SvGms = req.query.use_avg_SvGms === "true" ? 1 : 0;
  const use_avg_bpSaved = req.query.use_avg_bpSaved === "true" ? 1 : 0;
  const use_avg_bpFaced = req.query.use_avg_bpFaced === "true" ? 1 : 0;

  // make sure we have a valid number
  if (isNaN(betting_amount)) {
    res.json({NumMatches: 0,
      NumCorrect: 0,
      AmountBet: 0.0,
      AmountWon: 0.0,
      ROI: 0.0
    });
  }
  // make sure at least 1 statistic is turned on
  else if (
    use_avg_ace +
      use_avg_df +
      use_avg_svpt +
      use_avg_1stIn +
      use_avg_1stWon +
      use_avg_2ndWon +
      use_avg_SvGms +
      use_avg_bpSaved +
      use_avg_bpFaced ===
    0
  ) {
    res.json({
      NumMatches: 0,
      NumCorrect: 0,
      AmountBet: 0.0,
      AmountWon: 0.0,
      ROI: 0.0
    });
  } else {
    const connection = getConnection();
    connection.query(
      `
      WITH historical_player_stats AS (
        SELECT
          id,
          SUM(minutes)/SUM(nmatches) as avg_minutes,
          SUM(ace)/SUM(nmatches) as avg_ace,
          SUM(df)/SUM(nmatches) as avg_df,
          SUM(svpt)/SUM(nmatches) as avg_svpt,
          SUM(1stIn)/SUM(nmatches) as avg_1stIn,
          SUM(1stWon)/SUM(nmatches) as avg_1stWon,
          SUM(2ndWon)/SUM(nmatches) as avg_2ndWon,
          SUM(SvGms)/SUM(nmatches) as avg_SvGms,
          SUM(bpSaved)/SUM(nmatches) as avg_bpSaved,
          SUM(bpFaced)/SUM(nmatches) as avg_bpFaced
        FROM player_stats_yearly as player
        WHERE player.year < YEAR(?) # only allowed to use stats from before the betting simulation
        GROUP BY player.id
      ),
      valid_odds AS (
          SELECT
              AvgW,
              AvgL,
              winner_id,
              loser_id
          FROM odds
          JOIN game on odds.tourney_id = game.tourney_id and odds.match_num = game.match_num
          JOIN tournament ON game.tourney_id = tournament.id
          WHERE tournament.start_date >= ?
          AND tournament.start_date <= ?
      ), # betting odds of all matches given the query params
      bet_won AS (
        SELECT
          AvgW # bet multiplier (bet won)
        FROM valid_odds
        JOIN historical_player_stats AS W ON valid_odds.winner_id = W.id
        JOIN historical_player_stats AS L ON valid_odds.loser_id = L.id
        WHERE (W.avg_ace > L.avg_ace OR (?=1))
        AND (W.avg_df > L.avg_df OR (?=1))
        AND (W.avg_svpt > L.avg_svpt OR (?=1))
        AND (W.avg_1stIn > L.avg_1stIn OR (?=1))
        AND (W.avg_1stWon > L.avg_1stWon OR (?=1))
        AND (W.avg_2ndWon > L.avg_2ndWon OR (?=1))
        AND (W.avg_SvGms > L.avg_SvGms OR (?=1))
        AND (W.avg_bpSaved > L.avg_bpSaved OR (?=1))
        AND (W.avg_bpFaced > L.avg_bpFaced OR (?=1))
      ), # matches that met the criteria and the bet won
      bet_lost AS (
        SELECT
          0 # bet multiplier (bet lost)
        FROM valid_odds
        JOIN historical_player_stats AS W ON valid_odds.winner_id = W.id
        JOIN historical_player_stats AS L ON valid_odds.loser_id = L.id
        WHERE (L.avg_ace > W.avg_ace OR (?=1))
        AND (L.avg_df > W.avg_df OR (?=1))
        AND (L.avg_svpt > W.avg_svpt OR (?=1))
        AND (L.avg_1stIn > W.avg_1stIn OR (?=1))
        AND (L.avg_1stWon > W.avg_1stWon OR (?=1))
        AND (L.avg_2ndWon > W.avg_2ndWon OR (?=1))
        AND (L.avg_SvGms > W.avg_SvGms OR (?=1))
        AND (L.avg_bpSaved > W.avg_bpSaved OR (?=1))
        AND (L.avg_bpFaced > W.avg_bpFaced OR (?=1))
      ) # matches that met the criteria and the bet lost
      SELECT
        COUNT(*) as NumMatches,
        COUNT(NULLIF(AvgW,0)) as NumCorrect,
        ? * COUNT(*) as AmountBet,
        ? * SUM(AvgW) as AmountWon,
        ((? * SUM(AvgW)) - (? * COUNT(*)))/(? * COUNT(*)) as ROI
      FROM (SELECT * FROM bet_won UNION ALL SELECT * FROM bet_lost) bet_matches
      `,
      [
        start_date,
        start_date,
        end_date,
        1 - use_avg_ace,
        1 - use_avg_df,
        1 - use_avg_svpt,
        1 - use_avg_1stIn,
        1 - use_avg_1stWon,
        1 - use_avg_2ndWon,
        1 - use_avg_SvGms,
        1 - use_avg_bpSaved,
        1 - use_avg_bpFaced,
        1 - use_avg_ace,
        1 - use_avg_df,
        1 - use_avg_svpt,
        1 - use_avg_1stIn,
        1 - use_avg_1stWon,
        1 - use_avg_2ndWon,
        1 - use_avg_SvGms,
        1 - use_avg_bpSaved,
        1 - use_avg_bpFaced,
        betting_amount,
        betting_amount,
        betting_amount,
        betting_amount,
        betting_amount
      ],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
    connection.end();
  }
};

// route that retrieve aggregate stats for ml model
const betting_ml = async (req, res) => {
  const winner_id = parseInt(req.params.w_id);
  const loser_id = parseInt(req.params.l_id);
  const year = parseInt(req.params.year);

  // if player_id is not an integer, send empty json
  if (isNaN(winner_id) || isNaN(loser_id) || isNaN(year)) {
    res.json({});
  } else {
    connection.query(
      `
      WITH winner_tbl AS (
        SELECT
          SUM(ace)/SUM(nmatches) as w_avg_ace,
          SUM(df)/SUM(nmatches) as w_avg_df,
          SUM(svpt)/SUM(nmatches) as w_avg_svpt,
          SUM(1stIn)/SUM(nmatches) as w_avg_1stIn,
          SUM(1stWon)/SUM(nmatches) as w_avg_1stWon,
          SUM(2ndWon)/SUM(nmatches) as w_avg_2ndWon,
          SUM(SvGms)/SUM(nmatches) as w_avg_SvGms,
          SUM(bpSaved)/SUM(nmatches) as w_avg_bpSaved,
          SUM(bpFaced)/SUM(nmatches) as w_avg_bpFaced
        FROM player_stats_yearly
        WHERE id=?
        AND year < ?
      ),
      loser_tbl AS (
        SELECT
          SUM(ace)/SUM(nmatches) as l_avg_ace,
          SUM(df)/SUM(nmatches) as l_avg_df,
          SUM(svpt)/SUM(nmatches) as l_avg_svpt,
          SUM(1stIn)/SUM(nmatches) as l_avg_1stIn,
          SUM(1stWon)/SUM(nmatches) as l_avg_1stWon,
          SUM(2ndWon)/SUM(nmatches) as l_avg_2ndWon,
          SUM(SvGms)/SUM(nmatches) as l_avg_SvGms,
          SUM(bpSaved)/SUM(nmatches) as l_avg_bpSaved,
          SUM(bpFaced)/SUM(nmatches) as l_avg_bpFaced
        FROM player_stats_yearly
        WHERE id=?
        AND year < ?
      )
      SELECT * 
      FROM winner_tbl CROSS JOIN loser_tbl;
      `,
      [winner_id, year, loser_id, year],
      (err, data) => handleResponse(err, data, req.path, res, false)
    );
  }
};

const match_results = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  const connection = getConnection();
  connection.query(
    `
    SELECT
      winner_id,
      loser_id,
      YEAR(tournament.start_date) as year,
      AvgW
    FROM game
    JOIN tournament ON game.tourney_id = tournament.id
    JOIN odds ON game.match_num = odds.match_num
    AND game.tourney_id = odds.tourney_id
    WHERE tournament.start_date >= ?
    AND tournament.start_date <= ?
    `,
    [start_date, end_date],
    (err, data) => handleResponse(err, data, req.path, res, true)
  );
  connection.end();
};

const eligible_players = async (req, res) => {
  const year = parseInt(req.params.year);
  let league;

  if (year > 2023 || year < 1878) {
    res.json([]);
  }

  // validate league param
  if (req.params.league != "wta" && req.params.league != "atp") {
    league = ["atp", "wta"];
  } else {
    league = [req.params.league];
  }

  const connection = getConnection();
  connection.query(
    `
    SELECT name AS label, IDs.id AS id, league
    FROM player P INNER JOIN (
        SELECT DISTINCT id
        FROM player_stats_yearly
        WHERE year < ?
    ) IDs ON P.id=IDs.id INNER JOIN player_stats PS ON IDs.id=PS.player_id
    WHERE league IN (?)
    ORDER BY PS.wins DESC;
    `,
    [year, league],
    (err, data) => handleResponse(err, data, req.path, res)
  );
  connection.end();
};

const simulate_match = async (req, res) => {
  const player1_id = parseInt(req.params.player1_id);
  const player2_id = parseInt(req.params.player2_id);
  const year = parseInt(req.params.year);

  const connection = getConnection();
  connection.query(
    `
    SELECT *
    FROM
    (SELECT
      SUM(ace)/SUM(nmatches) as avg_ace_1,
      SUM(df)/SUM(nmatches) as avg_df_1,
      SUM(svpt)/SUM(nmatches) as avg_svpt_1,
      SUM(1stIn)/SUM(nmatches) as avg_1stIn_1,
      SUM(1stWon)/SUM(nmatches) as avg_1stWon_1,
      SUM(2ndWon)/SUM(nmatches) as avg_2ndWon_1,
      SUM(SvGms)/SUM(nmatches) as avg_SvGms_1,
      SUM(bpSaved)/SUM(nmatches) as avg_bpSaved_1,
      SUM(bpFaced)/SUM(nmatches) as avg_bpFaced_1
    FROM player_stats_yearly
    WHERE id=? AND year < ?) P1 CROSS JOIN
    (SELECT
      SUM(ace)/SUM(nmatches) as avg_ace_2,
      SUM(df)/SUM(nmatches) as avg_df_2,
      SUM(svpt)/SUM(nmatches) as avg_svpt_2,
      SUM(1stIn)/SUM(nmatches) as avg_1stIn_2,
      SUM(1stWon)/SUM(nmatches) as avg_1stWon_2,
      SUM(2ndWon)/SUM(nmatches) as avg_2ndWon_2,
      SUM(SvGms)/SUM(nmatches) as avg_SvGms_2,
      SUM(bpSaved)/SUM(nmatches) as avg_bpSaved_2,
      SUM(bpFaced)/SUM(nmatches) as avg_bpFaced
    FROM player_stats_yearly
    WHERE id=? AND year < ?) P2;
    `,
    [player1_id, year, player2_id, year],
    (err, data) => handleResponse(err, data, req.path, res, (res_array = false))
  );
  connection.end();
};

module.exports = {
  home,
  player,
  player_info,
  player_surface,
  player_winloss,
  player_stats,
  player_matches,
  player_average_stats,
  single_match,
  compare,
  tournament_home,
  tournament_select,
  tournament_alltime,
  tournament_names,
  getmatches,
  betting_favorite,
  betting_statistics,
  betting_ml,
  match_results,
  eligible_players,
  simulate_match,
};
