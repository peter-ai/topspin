const isValidTournament = (tourney_id) => {
  const tourney_year = parseInt(tourney_id.substring(0, 4));
  return tourney_year >= 1877 && tourney_year <= 2023;
};

const handleResponse = (err, data, path, res) => {
  // empty json if error or no data found (should not occur)
  if (err || data.length === 0) {
    if (err) {
      console.error(err);
    } else if (data.length == 0) {
      console.log(`${path} returned no data`);
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
