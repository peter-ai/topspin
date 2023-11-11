const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT;
const DATABASE = process.env.DATABASE;
const HOST = process.env.HOST;
const SERVER_PORT = process.env.VITE_SERVER_PORT;
const SERVER_HOST = process.env.VITE_SERVER_HOST;

module.exports = {
  USERNAME,
  PASSWORD,
  PORT,
  DATABASE,
  HOST,
  SERVER_PORT,
  SERVER_HOST,
};
