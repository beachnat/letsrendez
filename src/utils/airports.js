// Popular airports data for autocomplete
// Later: Replace with Amadeus Airport & City Search API

export const popularAirports = [
  { code: 'LAX', name: 'Los Angeles', fullName: 'Los Angeles (LAX)' },
  { code: 'JFK', name: 'New York', fullName: 'New York (JFK)' },
  { code: 'LGA', name: 'New York', fullName: 'New York (LGA)' },
  { code: 'EWR', name: 'Newark', fullName: 'Newark (EWR)' },
  { code: 'SFO', name: 'San Francisco', fullName: 'San Francisco (SFO)' },
  { code: 'ORD', name: 'Chicago', fullName: 'Chicago (ORD)' },
  { code: 'DFW', name: 'Dallas', fullName: 'Dallas (DFW)' },
  { code: 'DEN', name: 'Denver', fullName: 'Denver (DEN)' },
  { code: 'SEA', name: 'Seattle', fullName: 'Seattle (SEA)' },
  { code: 'LAS', name: 'Las Vegas', fullName: 'Las Vegas (LAS)' },
  { code: 'MIA', name: 'Miami', fullName: 'Miami (MIA)' },
  { code: 'ATL', name: 'Atlanta', fullName: 'Atlanta (ATL)' },
  { code: 'BOS', name: 'Boston', fullName: 'Boston (BOS)' },
  { code: 'PHX', name: 'Phoenix', fullName: 'Phoenix (PHX)' },
  { code: 'IAH', name: 'Houston', fullName: 'Houston (IAH)' },
  { code: 'MSP', name: 'Minneapolis', fullName: 'Minneapolis (MSP)' },
  { code: 'DTW', name: 'Detroit', fullName: 'Detroit (DTW)' },
  { code: 'PHL', name: 'Philadelphia', fullName: 'Philadelphia (PHL)' },
  { code: 'CLT', name: 'Charlotte', fullName: 'Charlotte (CLT)' },
  { code: 'BWI', name: 'Baltimore', fullName: 'Baltimore (BWI)' },
  { code: 'DCA', name: 'Washington DC', fullName: 'Washington DC (DCA)' },
  { code: 'IAD', name: 'Washington DC', fullName: 'Washington DC (IAD)' },
  { code: 'SAN', name: 'San Diego', fullName: 'San Diego (SAN)' },
  { code: 'PDX', name: 'Portland', fullName: 'Portland (PDX)' },
  { code: 'AUS', name: 'Austin', fullName: 'Austin (AUS)' },
  { code: 'BNA', name: 'Nashville', fullName: 'Nashville (BNA)' },
  { code: 'MCO', name: 'Orlando', fullName: 'Orlando (MCO)' },
  { code: 'FLL', name: 'Fort Lauderdale', fullName: 'Fort Lauderdale (FLL)' },
  { code: 'TPA', name: 'Tampa', fullName: 'Tampa (TPA)' },
  { code: 'STL', name: 'St. Louis', fullName: 'St. Louis (STL)' },
  { code: 'SLC', name: 'Salt Lake City', fullName: 'Salt Lake City (SLC)' },
  { code: 'CHS', name: 'Charleston', fullName: 'Charleston (CHS)' },
  { code: 'RDU', name: 'Raleigh', fullName: 'Raleigh (RDU)' },
  { code: 'MSY', name: 'New Orleans', fullName: 'New Orleans (MSY)' },
  { code: 'IND', name: 'Indianapolis', fullName: 'Indianapolis (IND)' },
  { code: 'CMH', name: 'Columbus', fullName: 'Columbus (CMH)' },
  { code: 'MCI', name: 'Kansas City', fullName: 'Kansas City (MCI)' },
  { code: 'MKE', name: 'Milwaukee', fullName: 'Milwaukee (MKE)' },
  { code: 'JAX', name: 'Jacksonville', fullName: 'Jacksonville (JAX)' },
  { code: 'PIT', name: 'Pittsburgh', fullName: 'Pittsburgh (PIT)' },
  { code: 'CVG', name: 'Cincinnati', fullName: 'Cincinnati (CVG)' },
  { code: 'CLE', name: 'Cleveland', fullName: 'Cleveland (CLE)' },
  { code: 'RIC', name: 'Richmond', fullName: 'Richmond (RIC)' },
  { code: 'MEM', name: 'Memphis', fullName: 'Memphis (MEM)' },
  { code: 'OKC', name: 'Oklahoma City', fullName: 'Oklahoma City (OKC)' },
  { code: 'SMF', name: 'Sacramento', fullName: 'Sacramento (SMF)' },
];

// Search airports by query (city name or airport code)
export const searchAirports = (query) => {
  if (!query || query.length < 1) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  
  return popularAirports.filter(airport => 
    airport.name.toLowerCase().includes(lowerQuery) ||
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.fullName.toLowerCase().includes(lowerQuery)
  ).slice(0, 8); // Limit to 8 results
};
