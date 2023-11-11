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

// test route to display data
const test = async (req, res) => {
  connection.query(
    `
    SELECT * FROM player;
    `, (err, data) => {
      if (err || data.length === 0) {
        // If there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);

        // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
        // return type you may need to return an empty array [] instead.
        res.json({});
      } else {
        // Here, we return results of the query as an object
          res.json(data);
      }
  });
}

module.exports = { 
  home,
  test, 
};
