/**
 * Parse IATA airport code from departure city string.
 * e.g. "Los Angeles (LAX)" -> "LAX", "New York (JFK)" -> "JFK"
 */
export function parseOriginCode(departureCity) {
  if (!departureCity || typeof departureCity !== 'string') return null;
  const match = departureCity.match(/\(([A-Z]{3})\)/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Map common destination names to IATA codes for flight search.
 * Add more as needed; later replace with destination autocomplete that stores IATA.
 */
const DESTINATION_TO_IATA = {
  'cabo': 'SJD',
  'cabo san lucas': 'SJD',
  'los cabos': 'SJD',
  'san jose del cabo': 'SJD',
  'miami': 'MIA',
  'miami beach': 'MIA',
  'new york': 'JFK',
  'nyc': 'JFK',
  'las vegas': 'LAS',
  'vegas': 'LAS',
  'san francisco': 'SFO',
  'sf': 'SFO',
  'los angeles': 'LAX',
  'la': 'LAX',
  'chicago': 'ORD',
  'denver': 'DEN',
  'phoenix': 'PHX',
  'orlando': 'MCO',
  'san diego': 'SAN',
  'seattle': 'SEA',
  'boston': 'BOS',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'houston': 'IAH',
  'puerto vallarta': 'PVR',
  'cancun': 'CUN',
  'mexico city': 'MEX',
  'tulum': 'CUN',
  'playa del carmen': 'CUN',
};

/**
 * Get IATA code for a destination string (city name or already a code).
 */
export function getDestinationCode(destination) {
  if (!destination || typeof destination !== 'string') return null;
  const trimmed = destination.trim().toLowerCase();
  if (/^[a-z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  return DESTINATION_TO_IATA[trimmed] || DESTINATION_TO_IATA[trimmed.replace(/,.*$/, '').trim()] || null;
}
