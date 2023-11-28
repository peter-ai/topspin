const isValidTournament = (tourney_id) => {
  const tourney_year = parseInt(tourney_id.substring(0, 4));
  return tourney_year >= 1877 && tourney_year <= 2023;
};

const handleResponse = (err, data, path, res, res_array=true) => {
  // empty json if error or no data found (should not occur)
  if (err || data.length === 0) {
    if (err) {
      console.error(err);
    } else if (data.length == 0) {
      console.log(`${path} returned no data`);
    }

    if (res_array) {
      // if res_array true, send array as JSON response
      res.json([]);
    } else {
      // else send an object as JSON response
      res.json({});
    }
    // successful query
  } else {
    if (res_array) {
      res.json(data);
    } else {
      res.json(data[0]);
    }
  }
};

module.exports = {
  isValidTournament,
  handleResponse,
};
