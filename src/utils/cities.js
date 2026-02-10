// Popular cities and airports for autocomplete
// Supports both airports (for flights) and cities (for driving/train/bus)

export const popularCities = [
  // Major cities (for driving/train/bus)
  { name: 'Los Angeles', code: 'LAX', type: 'city', fullName: 'Los Angeles, CA' },
  { name: 'New York', code: 'NYC', type: 'city', fullName: 'New York, NY' },
  { name: 'Chicago', code: 'CHI', type: 'city', fullName: 'Chicago, IL' },
  { name: 'San Francisco', code: 'SFO', type: 'city', fullName: 'San Francisco, CA' },
  { name: 'Miami', code: 'MIA', type: 'city', fullName: 'Miami, FL' },
  { name: 'Boston', code: 'BOS', type: 'city', fullName: 'Boston, MA' },
  { name: 'Seattle', code: 'SEA', type: 'city', fullName: 'Seattle, WA' },
  { name: 'Denver', code: 'DEN', type: 'city', fullName: 'Denver, CO' },
  { name: 'Las Vegas', code: 'LAS', type: 'city', fullName: 'Las Vegas, NV' },
  { name: 'Atlanta', code: 'ATL', type: 'city', fullName: 'Atlanta, GA' },
  { name: 'Dallas', code: 'DFW', type: 'city', fullName: 'Dallas, TX' },
  { name: 'Phoenix', code: 'PHX', type: 'city', fullName: 'Phoenix, AZ' },
  { name: 'Houston', code: 'IAH', type: 'city', fullName: 'Houston, TX' },
  { name: 'Philadelphia', code: 'PHL', type: 'city', fullName: 'Philadelphia, PA' },
  { name: 'San Diego', code: 'SAN', type: 'city', fullName: 'San Diego, CA' },
  { name: 'Minneapolis', code: 'MSP', type: 'city', fullName: 'Minneapolis, MN' },
  { name: 'Detroit', code: 'DTW', type: 'city', fullName: 'Detroit, MI' },
  { name: 'Portland', code: 'PDX', type: 'city', fullName: 'Portland, OR' },
  { name: 'Charlotte', code: 'CLT', type: 'city', fullName: 'Charlotte, NC' },
  { name: 'Orlando', code: 'MCO', type: 'city', fullName: 'Orlando, FL' },
  { name: 'Austin', code: 'AUS', type: 'city', fullName: 'Austin, TX' },
  { name: 'Nashville', code: 'BNA', type: 'city', fullName: 'Nashville, TN' },
  { name: 'Tampa', code: 'TPA', type: 'city', fullName: 'Tampa, FL' },
  { name: 'Salt Lake City', code: 'SLC', type: 'city', fullName: 'Salt Lake City, UT' },
  { name: 'Washington DC', code: 'DCA', type: 'city', fullName: 'Washington, DC' },
  { name: 'Baltimore', code: 'BWI', type: 'city', fullName: 'Baltimore, MD' },
  { name: 'St. Louis', code: 'STL', type: 'city', fullName: 'St. Louis, MO' },
  { name: 'Fort Lauderdale', code: 'FLL', type: 'city', fullName: 'Fort Lauderdale, FL' },
  { name: 'Charleston', code: 'CHS', type: 'city', fullName: 'Charleston, SC' },
  { name: 'Raleigh', code: 'RDU', type: 'city', fullName: 'Raleigh, NC' },
  { name: 'New Orleans', code: 'MSY', type: 'city', fullName: 'New Orleans, LA' },
  { name: 'Indianapolis', code: 'IND', type: 'city', fullName: 'Indianapolis, IN' },
  { name: 'Columbus', code: 'CMH', type: 'city', fullName: 'Columbus, OH' },
  { name: 'Kansas City', code: 'MCI', type: 'city', fullName: 'Kansas City, MO' },
  { name: 'Milwaukee', code: 'MKE', type: 'city', fullName: 'Milwaukee, WI' },
  { name: 'Jacksonville', code: 'JAX', type: 'city', fullName: 'Jacksonville, FL' },
  { name: 'Pittsburgh', code: 'PIT', type: 'city', fullName: 'Pittsburgh, PA' },
  { name: 'Cincinnati', code: 'CVG', type: 'city', fullName: 'Cincinnati, OH' },
  { name: 'Cleveland', code: 'CLE', type: 'city', fullName: 'Cleveland, OH' },
  { name: 'Richmond', code: 'RIC', type: 'city', fullName: 'Richmond, VA' },
  { name: 'Memphis', code: 'MEM', type: 'city', fullName: 'Memphis, TN' },
  { name: 'Oklahoma City', code: 'OKC', type: 'city', fullName: 'Oklahoma City, OK' },
  { name: 'Sacramento', code: 'SMF', type: 'city', fullName: 'Sacramento, CA' },
  // A few major international cities for quick picks
  { name: 'Barcelona', code: 'BCN', type: 'city', fullName: 'Barcelona, Spain' },
  { name: 'Madrid', code: 'MAD', type: 'city', fullName: 'Madrid, Spain' },

  // Airports (for flights) - fullName with (CODE) for origin/departure parsing
  { name: 'Los Angeles Airport', code: 'LAX', type: 'airport', fullName: 'Los Angeles (LAX)' },
  { name: 'New York JFK', code: 'JFK', type: 'airport', fullName: 'New York (JFK)' },
  { name: 'New York LGA', code: 'LGA', type: 'airport', fullName: 'New York (LGA)' },
  { name: 'Newark Airport', code: 'EWR', type: 'airport', fullName: 'Newark (EWR)' },
  { name: 'San Francisco Airport', code: 'SFO', type: 'airport', fullName: 'San Francisco (SFO)' },
  { name: 'Chicago O\'Hare', code: 'ORD', type: 'airport', fullName: 'Chicago (ORD)' },
  { name: 'Dallas Airport', code: 'DFW', type: 'airport', fullName: 'Dallas (DFW)' },
  { name: 'Denver Airport', code: 'DEN', type: 'airport', fullName: 'Denver (DEN)' },
  { name: 'Seattle Airport', code: 'SEA', type: 'airport', fullName: 'Seattle (SEA)' },
  { name: 'Las Vegas Airport', code: 'LAS', type: 'airport', fullName: 'Las Vegas (LAS)' },
  { name: 'Miami Airport', code: 'MIA', type: 'airport', fullName: 'Miami (MIA)' },
  { name: 'Atlanta Airport', code: 'ATL', type: 'airport', fullName: 'Atlanta (ATL)' },
  { name: 'Boston Airport', code: 'BOS', type: 'airport', fullName: 'Boston (BOS)' },
  { name: 'Phoenix Airport', code: 'PHX', type: 'airport', fullName: 'Phoenix (PHX)' },
  { name: 'Houston Airport', code: 'IAH', type: 'airport', fullName: 'Houston (IAH)' },
  { name: 'Minneapolis Airport', code: 'MSP', type: 'airport', fullName: 'Minneapolis (MSP)' },
  { name: 'Detroit Airport', code: 'DTW', type: 'airport', fullName: 'Detroit (DTW)' },
  { name: 'Philadelphia Airport', code: 'PHL', type: 'airport', fullName: 'Philadelphia (PHL)' },
  { name: 'Charlotte Airport', code: 'CLT', type: 'airport', fullName: 'Charlotte (CLT)' },
  { name: 'Baltimore Airport', code: 'BWI', type: 'airport', fullName: 'Baltimore (BWI)' },
  { name: 'Washington DC Airport', code: 'DCA', type: 'airport', fullName: 'Washington DC (DCA)' },
  { name: 'Washington DC Dulles', code: 'IAD', type: 'airport', fullName: 'Washington DC (IAD)' },
  { name: 'San Diego Airport', code: 'SAN', type: 'airport', fullName: 'San Diego (SAN)' },
  { name: 'Portland Airport', code: 'PDX', type: 'airport', fullName: 'Portland (PDX)' },
  { name: 'Austin Airport', code: 'AUS', type: 'airport', fullName: 'Austin (AUS)' },
  { name: 'Nashville Airport', code: 'BNA', type: 'airport', fullName: 'Nashville (BNA)' },
  { name: 'Orlando Airport', code: 'MCO', type: 'airport', fullName: 'Orlando (MCO)' },
  { name: 'Fort Lauderdale Airport', code: 'FLL', type: 'airport', fullName: 'Fort Lauderdale (FLL)' },
  { name: 'Tampa Airport', code: 'TPA', type: 'airport', fullName: 'Tampa (TPA)' },
  { name: 'St. Louis Airport', code: 'STL', type: 'airport', fullName: 'St. Louis (STL)' },
  { name: 'Salt Lake City Airport', code: 'SLC', type: 'airport', fullName: 'Salt Lake City (SLC)' },
  { name: 'Charleston Airport', code: 'CHS', type: 'airport', fullName: 'Charleston (CHS)' },
  { name: 'Raleigh Airport', code: 'RDU', type: 'airport', fullName: 'Raleigh (RDU)' },
  { name: 'New Orleans Airport', code: 'MSY', type: 'airport', fullName: 'New Orleans (MSY)' },
  { name: 'Indianapolis Airport', code: 'IND', type: 'airport', fullName: 'Indianapolis (IND)' },
  { name: 'Columbus Airport', code: 'CMH', type: 'airport', fullName: 'Columbus (CMH)' },
  { name: 'Kansas City Airport', code: 'MCI', type: 'airport', fullName: 'Kansas City (MCI)' },
  { name: 'Milwaukee Airport', code: 'MKE', type: 'airport', fullName: 'Milwaukee (MKE)' },
  { name: 'Jacksonville Airport', code: 'JAX', type: 'airport', fullName: 'Jacksonville (JAX)' },
  { name: 'Pittsburgh Airport', code: 'PIT', type: 'airport', fullName: 'Pittsburgh (PIT)' },
  { name: 'Cincinnati Airport', code: 'CVG', type: 'airport', fullName: 'Cincinnati (CVG)' },
  { name: 'Cleveland Airport', code: 'CLE', type: 'airport', fullName: 'Cleveland (CLE)' },
  { name: 'Richmond Airport', code: 'RIC', type: 'airport', fullName: 'Richmond (RIC)' },
  { name: 'Memphis Airport', code: 'MEM', type: 'airport', fullName: 'Memphis (MEM)' },
  { name: 'Oklahoma City Airport', code: 'OKC', type: 'airport', fullName: 'Oklahoma City (OKC)' },
  { name: 'Sacramento Airport', code: 'SMF', type: 'airport', fullName: 'Sacramento (SMF)' },
  { name: 'Barcelona Airport', code: 'BCN', type: 'airport', fullName: 'Barcelona (BCN)' },
  { name: 'Madrid Airport', code: 'MAD', type: 'airport', fullName: 'Madrid (MAD)' },
];

// Search cities/airports by query
export const searchCities = (query) => {
  if (!query || query.length < 1) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  
  return popularCities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.code.toLowerCase().includes(lowerQuery) ||
    city.fullName.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
};
