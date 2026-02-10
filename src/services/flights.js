import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

/**
 * Call the searchAirportCities Cloud Function (Amadeus Airport & City Search).
 * @param {string} keyword - Search term (e.g. "Charleston", "CHS")
 * @returns {Promise<{ results: Array<{ code, name, fullName, type }>, error?: string }>}
 */
export async function searchAirportCities(keyword) {
  try {
    const searchAirportCitiesFn = httpsCallable(functions, 'searchAirportCities');
    const result = await searchAirportCitiesFn({ keyword: keyword.trim() });
    const data = result.data;
    return {
      results: data.results || [],
      error: data.error,
    };
  } catch (err) {
    console.error('Airport/city search error:', err);
    return {
      results: [],
      error: err.message || 'Could not search airports. Please try again.',
    };
  }
}

/**
 * Combined search for origin/destination: static list for short queries, Amadeus API for 2+ chars.
 * Use as searchFunction in AutocompleteInput. Returns Promise<array> so async is supported.
 * @param {string} query
 * @param {function} staticSearch - sync function (query) => array, e.g. searchCities from utils/cities
 * @returns {Promise<Array<{ code, name, fullName, type }>>}
 */
export async function searchCitiesWithApi(query, staticSearch) {
  const q = (query && query.trim()) || '';
  if (q.length < 2) {
    const list = staticSearch ? staticSearch(q) : [];
    return Array.isArray(list) ? list : [];
  }
  const { results, error } = await searchAirportCities(q);

  // If the API fails, gracefully fall back to the static list
  if (error) {
    const list = staticSearch ? staticSearch(q) : [];
    return Array.isArray(list) ? list : [];
  }

  const apiResults = results || [];
  // If the API returns no matches (or test env is sparse), also fall back
  if (apiResults.length === 0 && staticSearch) {
    const list = staticSearch(q) || [];
    return Array.isArray(list) ? list : [];
  }

  return apiResults;
}

/**
 * Call the searchFlights Cloud Function.
 * @param {Object} params - { originCode, destinationCode, departureDate, returnDate?, adults }
 * @returns {Promise<{ flights: Array, searchUrl?: string, error?: string }>}
 */
export async function searchFlights(params) {
  try {
    const searchFlightsFn = httpsCallable(functions, 'searchFlights');
    const result = await searchFlightsFn({
      originCode: params.originCode,
      destinationCode: params.destinationCode,
      departureDate: params.departureDate,
      returnDate: params.returnDate || null,
      adults: params.adults ?? 1,
    });
    const data = result.data;
    return {
      flights: data.flights || [],
      searchUrl: data.searchUrl,
      error: data.error,
    };
  } catch (err) {
    console.error('Flight search error:', err);
    return {
      flights: [],
      error: err.message || 'Could not load flights. Please try again.',
    };
  }
}
