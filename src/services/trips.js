import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, auth, app } from './firebase';

const functions = getFunctions(app);

const TRIPS_COLLECTION = 'trips';

function sortTripsByCreatedAt(trips) {
  return [...trips].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime; // newest first
  });
}

/**
 * Create a new trip in Firestore. Destination optional; members set their own origins.
 * @param {Object} tripData - { name, groupSize, budget, tripType?, startDate?, endDate?, destination?, destinationCode?, destinationHint?, tripPreferences? }
 * @returns {Promise<string>} The new trip document ID
 */
export async function createTrip(tripData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to create a trip');
  }

  const docRef = await addDoc(collection(db, TRIPS_COLLECTION), {
    name: tripData.name,
    groupSize: tripData.groupSize,
    budget: tripData.budget,
    tripType: tripData.tripType || null,
    tripPreferences: tripData.tripPreferences || null,
    startDate: tripData.startDate || null,
    endDate: tripData.endDate || null,
    destination: tripData.destination || null,
    destinationCode: tripData.destinationCode || null,
    destinationHint: tripData.destinationHint || null,
    createdBy: user.uid,
    members: [user.uid],
    memberOrigins: {},
    status: 'planning',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Get a single trip by ID. Returns null if not found or user is not a member.
 * @param {string} tripId
 * @returns {Promise<{ id: string, ...trip } | null>}
 */
export async function getTrip(tripId) {
  if (!tripId) return null;
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  if (!data.members || !data.members.includes(user.uid)) return null;

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
  };
}

/**
 * Update an existing trip. Only members can update.
 * @param {string} tripId
 * @param {Object} updates - Fields to update (name, groupSize, budget, tripType, startDate, endDate, destination, destinationCode, destinationHint, status)
 */
export async function updateTrip(tripId, updates) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to update a trip');

  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error('Trip not found');
  const data = snapshot.data();
  if (!data.members || !data.members.includes(user.uid)) {
    throw new Error('You do not have permission to edit this trip');
  }

  const allowed = [
    'name', 'groupSize', 'budget', 'tripType', 'tripPreferences', 'startDate', 'endDate',
    'destination', 'destinationCode', 'destinationHint', 'status',
  ];
  const toSet = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) {
      toSet[key] = updates[key] === '' ? null : updates[key];
    }
  });
  if (Object.keys(toSet).length === 0) return;

  await updateDoc(docRef, toSet);
}

/**
 * Set the current user's departure (origin) for a trip. Stored in memberOrigins[tripId][userId].
 * @param {string} tripId
 * @param {string} departureCity - Display name, e.g. "Los Angeles (LAX)"
 * @param {string} departureCode - IATA code, e.g. "LAX"
 */
export async function updateMyOrigin(tripId, departureCity, departureCode) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to set your departure');

  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error('Trip not found');
  const data = snapshot.data();
  if (!data.members || !data.members.includes(user.uid)) {
    throw new Error('You are not a member of this trip');
  }

  const memberOrigins = { ...(data.memberOrigins || {}), [user.uid]: { departureCity: departureCity || null, departureCode: departureCode || null } };
  await updateDoc(docRef, { memberOrigins });
}

/**
 * Invite people to a trip by email (trip creator only). Stores emails on the trip; actual email sending can be added later.
 * @param {string} tripId
 * @param {string[]} emails - Array of email addresses
 * @returns {Promise<{ success: boolean, invited: string[] }>}
 */
export async function inviteMembersByEmail(tripId, emails) {
  const fn = httpsCallable(functions, 'sendTripInvite');
  const result = await fn({ tripId, emails });
  return result.data;
}

/**
 * Accept an invite to a trip (add current user to members). Callable runs with tripId.
 * @param {string} tripId
 * @returns {Promise<{ success: boolean, tripName?: string, alreadyMember?: boolean }>}
 */
export async function acceptTripInvite(tripId) {
  const fn = httpsCallable(functions, 'acceptTripInvite');
  const result = await fn({ tripId });
  return result.data;
}

/**
 * Fetch AI destination suggestions for a trip. Any trip member can call this.
 * @param {Object} params - { tripId, tripType, budgetPerPerson, groupSize, departureDate, returnDate, memberOrigins: { [uid]: departureCode }, destinationHint?, limit? }
 * @returns {Promise<{ suggestions: Array<{ name, iataCode, blurb, costTier }>, error?: string }>}
 */
export async function getDestinationSuggestions(params) {
  const fn = httpsCallable(functions, 'getDestinationSuggestions');
  const result = await fn(params);
  return result.data;
}

/**
 * Like or unlike a destination suggestion for a trip. Any trip member can do this; likes are shared with the group.
 * @param {string} tripId
 * @param {string} iataCode - e.g. "SJD"
 * @param {boolean} liked
 * @returns {Promise<{ success: boolean, liked: boolean, likedBy: string[] }>} likedBy = list of member uids who like this destination
 */
export async function likeDestinationSuggestion(tripId, iataCode, liked) {
  const fn = httpsCallable(functions, 'likeDestinationSuggestion');
  const result = await fn({ tripId, iataCode, liked });
  return result.data;
}

/**
 * Build the shareable invite link for a trip (web app URL with ?invite=tripId).
 * On web uses current origin; otherwise uses a default base URL for sharing.
 * @param {string} tripId
 * @returns {string}
 */
export function getInviteLink(tripId) {
  if (!tripId) return '';
  const base =
    typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://letsrendez.app';
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}invite=${encodeURIComponent(tripId)}`;
}

/**
 * Get all trips for the current user (created by or member of).
 * @returns {Promise<Array<{ id: string, ...trip }>>}
 */
export async function getUserTrips() {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('members', 'array-contains', user.uid)
  );

  const snapshot = await getDocs(q);
  const trips = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
  }));
  return sortTripsByCreatedAt(trips);
}

/**
 * Subscribe to the current user's trips in real time.
 * @param {function(Array)} callback - Called with trips array whenever data changes
 * @returns {function} Unsubscribe function
 */
export function subscribeToUserTrips(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('members', 'array-contains', user.uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
      }));
      callback(sortTripsByCreatedAt(trips));
    },
    (error) => {
      console.error('Error loading trips:', error);
      callback([]);
    }
  );
}
