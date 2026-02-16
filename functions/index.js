const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const path = require('path');

// Load .env from functions/ when running (e.g. emulator)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {}

admin.initializeApp();

const AMADEUS_TEST = 'https://test.api.amadeus.com';
const AMADEUS_PROD = 'https://api.amadeus.com';

// Common IATA airline codes → display name (Amadeus returns carrierCode per segment)
const AIRLINE_NAMES = {
  AA: 'American Airlines',
  AS: 'Alaska Airlines',
  B6: 'JetBlue',
  DL: 'Delta Air Lines',
  F9: 'Frontier',
  G4: 'Allegiant Air',
  NK: 'Spirit Airlines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  AC: 'Air Canada',
  AM: 'Aeromexico',
  BA: 'British Airways',
  JB: 'JetBlue', // alternate
  KL: 'KLM',
  LH: 'Lufthansa',
  MX: 'Breeze Airways',
  SY: 'Sun Country',
  VX: 'Virgin America',
  Y4: 'Volaris',
};

function getAmadeusCredentials() {
  const config = functions.config().amadeus || {};
  return {
    clientId: config.client_id || process.env.AMADEUS_CLIENT_ID,
    clientSecret: config.client_secret || process.env.AMADEUS_CLIENT_SECRET,
  };
}

function getOpenAICredentials() {
  const config = functions.config().openai || {};
  return {
    apiKey: config.api_key || process.env.OPENAI_API_KEY,
  };
}

/** Kayak affiliate ID for outbound flight links (param "a"). Set in config or KAYAK_AFFILIATE_ID in .env. */
function getKayakAffiliateId() {
  const config = functions.config().kayak || {};
  return config.affiliate_id || process.env.KAYAK_AFFILIATE_ID || '';
}

/** Kayak sandbox API key for Flights Search API calls. Set KAYAK_SANDBOX_API_KEY in .env or kayak.sandbox_api_key in config. */
function getKayakSandboxApiKey() {
  const config = functions.config().kayak || {};
  return config.sandbox_api_key || process.env.KAYAK_SANDBOX_API_KEY || '';
}

/** Base URL for Kayak API (sandbox or production). Set KAYAK_API_BASE_URL if different from your Kayak developer docs. */
function getKayakApiBaseUrl() {
  return process.env.KAYAK_API_BASE_URL || 'https://api.kayak.com';
}

/**
 * Call KAYAK Flights Search API (https://developers.kayak.com/flights-search-api).
 * When the API returns a different shape, adjust parsing here to match the docs.
 * @returns {Promise<Array<{ id, price, currency, departure, arrival, departureTime, arrivalTime, duration?, carrierCode?, airlineName?, searchUrl }>>}
 */
async function fetchKayakFlights(origin, destination, dep, ret, adultsCount, searchUrl) {
  const apiKey = getKayakSandboxApiKey();
  if (!apiKey) return [];

  const baseUrl = getKayakApiBaseUrl().replace(/\/$/, '');
  const path = process.env.KAYAK_FLIGHTS_PATH || '/v1/flights/search';

  try {
    const body = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: dep,
      adults: adultsCount,
      ...(ret && { returnDate: ret }),
    };

    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Kayak Flights API error:', res.status, errText);
      return [];
    }

    const data = await res.json();

    // Normalize: support data.data (Amadeus-style), data.results, data.flights, or data.offers
    const rawOffers = data.data ?? data.results ?? data.flights ?? data.offers ?? [];
    if (!Array.isArray(rawOffers)) return [];

    return rawOffers.map((offer, index) => {
      const price = offer.price?.total ?? offer.totalPrice ?? offer.price ?? offer.amount;
      const seg = offer.itineraries?.[0]?.segments?.[0] ?? offer.segments?.[0] ?? offer.outbound?.[0];
      const lastSeg = offer.itineraries?.[0]?.segments?.slice(-1)[0] ?? offer.segments?.slice(-1)[0] ?? offer.outbound?.slice(-1)[0];
      const depIata = seg?.departure?.iataCode ?? seg?.origin ?? offer.origin;
      const arrIata = lastSeg?.arrival?.iataCode ?? lastSeg?.destination ?? offer.destination;
      const depAt = seg?.departure?.at ?? seg?.departureTime ?? offer.departureTime;
      const arrAt = lastSeg?.arrival?.at ?? lastSeg?.arrivalTime ?? offer.arrivalTime;
      const carrierCode = seg?.carrierCode ?? offer.carrier ?? offer.airline;
      const airlineName = carrierCode ? AIRLINE_NAMES[carrierCode] || null : null;

      return {
        id: offer.id ?? `kayak-${index}-${Date.now()}`,
        price: String(price ?? '0'),
        currency: offer.price?.currency ?? offer.currency ?? 'USD',
        departure: depIata ?? origin,
        arrival: arrIata ?? destination,
        departureTime: depAt ?? null,
        arrivalTime: arrAt ?? null,
        duration: offer.itineraries?.[0]?.duration ?? offer.duration ?? null,
        numberOfBookableSeats: offer.numberOfBookableSeats ?? null,
        carrierCode: carrierCode ?? null,
        airlineName,
        searchUrl,
        source: 'kayak',
      };
    });
  } catch (err) {
    console.warn('Kayak Flights API fetch failed:', err.message);
    return [];
  }
}

async function getAmadeusToken(baseUrl, clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  const res = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Callable: searchAirportCities
 * Body: { keyword: string } — search term (min 2 chars recommended)
 * Returns: { results: [{ code, name, fullName, type: 'airport'|'city' }] } or { error: string }
 * Uses Amadeus Airport & City Search (v1 reference-data/locations).
 */
exports.searchAirportCities = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const keyword = typeof (data && data.keyword) === 'string' ? data.keyword.trim() : '';
  if (keyword.length < 1) {
    return { results: [] };
  }

  const { clientId, clientSecret } = getAmadeusCredentials();
  if (!clientId || !clientSecret) {
    console.error('Amadeus credentials missing. Set functions config or functions/.env');
    return {
      results: [],
      error: 'Airport search is not configured. Please try again later.',
    };
  }

  const baseUrl = process.env.AMADEUS_HOST === 'production' ? AMADEUS_PROD : AMADEUS_TEST;

  try {
    const token = await getAmadeusToken(baseUrl, clientId, clientSecret);

    const params = new URLSearchParams({
      subType: 'AIRPORT,CITY',
      keyword: keyword.slice(0, 64),
      'page[limit]': '12',
      view: 'LIGHT',
    });

    const res = await fetch(`${baseUrl}/v1/reference-data/locations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Amadeus airport/city search error:', res.status, errText);
      return {
        results: [],
        error: 'Could not search airports. Please try again.',
      };
    }

    const json = await res.json();
    const dataList = json.data || [];

    const results = dataList
      .filter((loc) => loc.iataCode && loc.name)
      .map((loc) => {
        const code = String(loc.iataCode).toUpperCase().slice(0, 3);
        const name = String(loc.name).trim();
        const cityName = (loc.address && loc.address.cityName) ? String(loc.address.cityName).trim() : (loc.cityName ? String(loc.cityName).trim() : '');
        const displayName = cityName && cityName !== name ? `${cityName} (${code})` : `${name} (${code})`;
        const subType = (loc.subType || '').toUpperCase();
        return {
          code,
          name,
          fullName: displayName,
          type: subType === 'CITY' ? 'city' : 'airport',
        };
      });

    return { results };
  } catch (err) {
    console.error('searchAirportCities error:', err);
    return {
      results: [],
      error: err.message || 'Airport search failed. Please try again.',
    };
  }
});

/**
 * Callable: searchFlights
 * Body: { originCode, destinationCode, departureDate, returnDate?, adults }
 * Returns: { flights: [...], searchUrl?: string } or { error: string }
 *
 * Each flight in flights[] has:
 *   id, price, currency, departure (IATA), arrival (IATA),
 *   departureTime, arrivalTime (ISO), duration (PTnHnM),
 *   numberOfBookableSeats, carrierCode, airlineName, searchUrl, source? ('amadeus'|'kayak').
 * When KAYAK_SANDBOX_API_KEY is set, results are merged from Amadeus + KAYAK Flights Search API (https://developers.kayak.com/flights-search-api).
 */
exports.searchFlights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { originCode, destinationCode, departureDate, returnDate, adults } = data || {};
  const adultsCount = Math.min(Math.max(Number(adults) || 1, 1), 9);

  if (!originCode || !destinationCode || !departureDate) {
    return {
      flights: [],
      error: 'Missing origin, destination, or departure date.',
    };
  }

  const origin = String(originCode).toUpperCase().slice(0, 3);
  const destination = String(destinationCode).toUpperCase().slice(0, 3);
  const dep = String(departureDate).slice(0, 10);
  const ret = returnDate ? String(returnDate).slice(0, 10) : undefined;

  const { clientId, clientSecret } = getAmadeusCredentials();
  if (!clientId || !clientSecret) {
    console.error('Amadeus credentials missing. Set functions config or functions/.env');
    return {
      flights: [],
      error: 'Flight search is not configured. Please try again later.',
    };
  }

  const baseUrl = process.env.AMADEUS_HOST === 'production' ? AMADEUS_PROD : AMADEUS_TEST;

  try {
    const token = await getAmadeusToken(baseUrl, clientId, clientSecret);

    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: dep,
      adults: String(adultsCount),
      max: '10',
    });
    if (ret) params.set('returnDate', ret);

    const searchRes = await fetch(`${baseUrl}/v2/shopping/flight-offers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error('Amadeus flight search error:', searchRes.status, errText);
      return {
        flights: [],
        error: 'Could not load flights. Try different dates or airports.',
      };
    }

    const searchData = await searchRes.json();

    // Log full Amadeus response metadata (view in Firebase: firebase functions:log)
    console.log('Amadeus flight search – full response:', JSON.stringify(searchData, null, 2));

    const offers = searchData.data || [];

    const kayakBase =
      `https://www.kayak.com/flights/${origin}-${destination}/${dep}` +
      (ret ? `-${ret}` : '') +
      `/${adultsCount}adults`;
    const kayakAffiliateId = getKayakAffiliateId();
    const searchUrl = kayakAffiliateId
      ? `${kayakBase}?a=${encodeURIComponent(kayakAffiliateId)}`
      : kayakBase;

    const amadeusFlights = offers.map((offer) => {
      const seg = offer.itineraries?.[0]?.segments?.[0];
      const lastSeg = offer.itineraries?.[0]?.segments?.[offer.itineraries[0].segments.length - 1];
      const carrierCode = seg?.carrierCode || offer.itineraries?.[0]?.segments?.[0]?.carrierCode;
      const airlineName = carrierCode ? AIRLINE_NAMES[carrierCode] || null : null;
      return {
        id: offer.id,
        price: offer.price?.total,
        currency: offer.price?.currency || 'USD',
        departure: seg?.departure?.iataCode,
        arrival: lastSeg?.arrival?.iataCode,
        departureTime: seg?.departure?.at,
        arrivalTime: lastSeg?.arrival?.at,
        duration: offer.itineraries?.[0]?.duration,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        carrierCode: carrierCode || null,
        airlineName: airlineName || null,
        searchUrl,
        source: 'amadeus',
      };
    });

    // Optional: call KAYAK Flights Search API when KAYAK_SANDBOX_API_KEY is set (https://developers.kayak.com/flights-search-api)
    let kayakFlights = [];
    if (getKayakSandboxApiKey()) {
      kayakFlights = await fetchKayakFlights(origin, destination, dep, ret, adultsCount, searchUrl);
    }

    const flights = [...amadeusFlights, ...kayakFlights]
      .sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
      .slice(0, 20);

    return { flights, searchUrl };
  } catch (err) {
    console.error('searchFlights error:', err);
    return {
      flights: [],
      error: err.message || 'Flight search failed. Please try again.',
    };
  }
});

/**
 * Callable: getDestinationSuggestions
 * Phase 1 (AI-DESTINATION-PLAN): LLM-only suggestions when trip has no destination.
 * Inputs: tripId?, tripType, budgetPerPerson, groupSize, departureDate, returnDate,
 *         memberOrigins (Record<uid, IATA>), destinationHint?, limit? (default 3).
 * Returns: { suggestions: [{ name, iataCode, blurb, costTier }] } or { error: string }
 */
exports.getDestinationSuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const {
    tripId,
    tripType,
    budgetPerPerson,
    groupSize,
    departureDate,
    returnDate,
    memberOrigins,
    destinationHint,
    limit: requestedLimit,
  } = data || {};

  const limit = Math.min(Math.max(Number(requestedLimit) || 3, 1), 10);
  const budget = Number(budgetPerPerson) || 0;
  const group = Math.max(Number(groupSize) || 1, 1);

  if (!tripType || !departureDate || !returnDate) {
    return {
      suggestions: [],
      error: 'Missing trip type, departure date, or return date.',
    };
  }

  if (tripId && typeof tripId === 'string') {
    const db = admin.firestore();
    const tripRef = db.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Trip not found.');
    }
    const members = tripSnap.data().members || [];
    if (!members.includes(context.auth.uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Only trip members can get suggestions for this trip.');
    }
  }

  const originsList =
    memberOrigins && typeof memberOrigins === 'object'
      ? Object.values(memberOrigins).filter((c) => typeof c === 'string' && c.length > 0)
      : [];
  const departureCities =
    originsList.length > 0 ? originsList.join(', ') : 'Not specified';

  const { apiKey } = getOpenAICredentials();
  if (!apiKey) {
    console.error('OpenAI API key missing. Set functions config openai.api_key or OPENAI_API_KEY in functions/.env');
    return {
      suggestions: [],
      error: 'Destination suggestions are not configured. Please try again later.',
    };
  }

  const hintBlock =
    destinationHint && String(destinationHint).trim()
      ? `\nUser hint: "${String(destinationHint).trim()}"\nPrioritize destinations that match this hint (region, vibe, or constraint). If the hint is a region, only suggest destinations in that region. If it\'s a vibe (e.g. "good nightlife"), rank by fit. If it\'s a constraint (e.g. "not too far"), filter accordingly.\n`
      : '';

  const systemPrompt = `You are a travel advisor for group trips. Reply only with a valid JSON array. No markdown, no code fences.`;
  const userPrompt =
    `Given:
- Trip type: ${String(tripType)}
- Budget per person: $${budget}
- Group size: ${group}
- Dates: ${String(departureDate).slice(0, 10)} to ${String(returnDate).slice(0, 10)}
- Departure city/cities: ${departureCities}
${hintBlock}Suggest ${limit} affordable destinations that fit this trip. For each destination provide: name, IATA airport code (e.g. SJD for Cabo), 1–2 sentence blurb, and cost tier (exactly one of: "under", "at", "over"). Be concise.
Return a JSON array of objects with keys: name, iataCode, blurb, costTier. Example: [{"name":"Cabo San Lucas","iataCode":"SJD","blurb":"Beach and nightlife hub.","costTier":"at"}]`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('OpenAI API error:', res.status, errText);
      return {
        suggestions: [],
        error: 'Could not load destination suggestions. Please try again.',
      };
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content?.trim() || '';
    if (!content) {
      return { suggestions: [], error: 'No suggestions returned.' };
    }

    // Strip markdown code block if present
    let raw = content;
    const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeMatch) raw = codeMatch[1].trim();
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    const suggestions = list
      .filter((item) => item && (item.name || item.iataCode))
      .map((item) => ({
        name: String(item.name || item.iataCode || 'Unknown').slice(0, 120),
        iataCode: String(item.iataCode || '').toUpperCase().slice(0, 3),
        blurb: String(item.blurb || '').slice(0, 300),
        costTier: ['under', 'at', 'over'].includes(item.costTier) ? item.costTier : 'at',
      }))
      .filter((s) => s.iataCode);

    return { suggestions };
  } catch (err) {
    console.error('getDestinationSuggestions error:', err);
    return {
      suggestions: [],
      error: err.message || 'Destination suggestions failed. Please try again.',
    };
  }
});

/**
 * Callable: likeDestinationSuggestion
 * Any trip member can like or unlike a destination suggestion (by IATA code). Shared with the group.
 * Body: { tripId: string, iataCode: string, liked: boolean }
 * Returns: { success: true, liked: boolean, likedBy: string[] } (likedBy = list of member uids who like this destination)
 */
exports.likeDestinationSuggestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { tripId, iataCode, liked } = data || {};
  if (!tripId || typeof tripId !== 'string' || !iataCode || typeof iataCode !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'tripId and iataCode are required.');
  }

  const code = String(iataCode).toUpperCase().trim().slice(0, 3);
  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid iataCode.');
  }

  const db = admin.firestore();
  const tripRef = db.collection('trips').doc(tripId);
  const uid = context.auth.uid;

  const result = await db.runTransaction(async (tx) => {
    const tripSnap = await tx.get(tripRef);
    if (!tripSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Trip not found.');
    }
    const trip = tripSnap.data();
    const members = trip.members || [];
    if (!members.includes(uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Only trip members can like suggestions.');
    }

    const suggestionLikes = { ...(trip.suggestionLikes || {}) };
    const current = Array.isArray(suggestionLikes[code]) ? suggestionLikes[code] : [];
    let next;
    if (liked) {
      next = current.includes(uid) ? current : [...current, uid];
    } else {
      next = current.filter((id) => id !== uid);
    }
    suggestionLikes[code] = next;
    if (next.length === 0) delete suggestionLikes[code];

    tx.update(tripRef, { suggestionLikes });
    return { liked: !!liked, likedBy: next };
  });

  return { success: true, liked: result.liked, likedBy: result.likedBy };
});

/**
 * Callable: sendTripInvite
 * Body: { tripId, emails: string[] }
 * Adds emails to trip.invitedEmails (creator only). Email sending can be added later.
 */
exports.sendTripInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { tripId, emails } = data || {};
  if (!tripId || !Array.isArray(emails) || emails.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'tripId and non-empty emails array required.');
  }

  const db = admin.firestore();
  const tripRef = db.collection('trips').doc(tripId);
  const tripSnap = await tripRef.get();
  if (!tripSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Trip not found.');
  }

  const trip = tripSnap.data();
  const uid = context.auth.uid;
  const isCreator = trip.createdBy === uid;
  const isMember = (trip.members || []).includes(uid);
  if (!isMember || !isCreator) {
    throw new functions.https.HttpsError('permission-denied', 'Only the trip creator can invite members.');
  }

  const normalized = emails
    .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
    .filter((e) => e && e.includes('@'));

  if (normalized.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No valid email addresses.');
  }

  await tripRef.update({
    invitedEmails: admin.firestore.FieldValue.arrayUnion(...normalized),
  });

  return { success: true, invited: normalized };
});

/**
 * Callable: acceptTripInvite
 * Body: { tripId: string }
 * Adds the current user to the trip's members (anyone with the link can join). Returns trip name.
 */
exports.acceptTripInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to join a trip.');
  }

  const { tripId } = data || {};
  if (!tripId || typeof tripId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'tripId is required.');
  }

  const db = admin.firestore();
  const tripRef = db.collection('trips').doc(tripId);
  const tripSnap = await tripRef.get();
  if (!tripSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Trip not found.');
  }

  const trip = tripSnap.data();
  const uid = context.auth.uid;
  const members = trip.members || [];

  if (members.includes(uid)) {
    return { success: true, alreadyMember: true, tripName: trip.name || 'This trip' };
  }

  await tripRef.update({
    members: admin.firestore.FieldValue.arrayUnion(uid),
  });

  return { success: true, tripName: trip.name || 'This trip' };
});
