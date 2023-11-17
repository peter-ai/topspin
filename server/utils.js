const handleResponse = (err, data, path, res) => {
  // empty json if error or no data found (should not occur)
  if (err || data.length === 0) {
    if (err) {
      console.log(err);
    }
    if (data.length == 0) {
      console.log(`${path} returned empty data`);
    }
    res.json([]);
    // successful query
  } else {
    res.json(data);
  }
};

module.exports = {
  isValidTournament,
  handleResponse,
};
