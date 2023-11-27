import { lookup } from 'country-data';

// utility function function that handles getting the country and flag of players
export function getPlayerFlag(player_ioc) {
  // if ioc is UNK or null return N/A
  if (!player_ioc || player_ioc==='UNK') {return 'N/A'}

  // define list of unmatched country codes
  const unmatched = {
    AHO: 'Netherlands Antilles',
    CAR: 'Carribean/West Indies',
    URS: 'Soviet Union (USSR)',
    FRG: 'West Germany',
    GDR: 'East Germany',
    TCH: 'Czechoslovakia',
  };

  // check if ioc country code is list of unmatched
  if (unmatched[player_ioc]) {return unmatched[player_ioc]}

  // attempt lookup of ioc country code
  let country = lookup.countries({ioc: player_ioc})
  if (!country.length) {
    // if unsuccessful attempt lookup of alpha-3 ISO code
    country = lookup.countries({alpha3: player_ioc});
    if (!country.length) {
      // if unsuccessful return N/A
      return 'N/A';
    } 
  }

  if (country[0]['emoji']) {
    // if country has emoji return emoji with country name
    return country[0]['emoji'] + ' ' + country[0]['name'].split(', ')[0];
  } else {
    // otherwise return country name
    return country[0]['name'].split(', ')[0];
  }
};

// utility function to assist in formatting dates in UTC
export function getDate(dateStr, date_type) {
  if (dateStr) {
    const utc_date = new Date(new Date(dateStr).toUTCString());
    if (date_type === 'player') {
      return utc_date.toLocaleString(
        'en-US', 
        {
          timeZone: 'UTC', 
          year: "numeric", 
          month: "long", 
          day: "numeric"
        });
    } else {
      return utc_date.toLocaleString(
        'en-US', 
        {
          timeZone: 'UTC', 
          year: "numeric", 
          month: "numeric", 
          day: "numeric"
        });
    }
  } else {
    return 'N/A';
  }
};

// utility function to assist in formatting player hand
export function getPlayerHand(hand) {
  if (hand === 'R') {
    return 'Right';
  } else if (hand === 'L') {
    return 'Left';
  } else {
    return 'Unknown';
  }
};