import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

function getUserOrThrow() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in');
  return user;
}

function tripAccommodationCollection(tripId) {
  return collection(db, 'trips', tripId, 'accommodation');
}

/**
 * Create the main shared accommodation for a trip.
 * Stores itinerary + basic cost/split info in one document.
 */
export async function createTripAccommodation(tripId, data) {
  const user = getUserOrThrow();

  const participants =
    Array.isArray(data.participants) && data.participants.length
      ? data.participants
      : [user.uid];

  const total = Number(data.totalAmount) || 0;
  const evenShare = total && participants.length ? total / participants.length : 0;

  const shares = {};
  participants.forEach((id) => {
    shares[id] = {
      amount:
        data.splitType === 'custom'
          ? (data.customShares && data.customShares[id]) ?? 0
          : evenShare,
      status: id === user.uid ? 'paid' : 'pending',
    };
  });

  const colRef = tripAccommodationCollection(tripId);
  const docRef = await addDoc(colRef, {
    title: data.title || '',
    link: data.link || null,
    address: data.address || null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    notes: data.notes || null,
    payerId: user.uid,
    participants,
    totalAmount: total,
    currency: data.currency || 'USD',
    splitType: data.splitType || 'even', // 'even' or 'custom'
    shares,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Fetch the trip's accommodation documents.
 * For V1 we assume at most one and return the first or null.
 */
export async function getTripAccommodation(tripId) {
  const colRef = tripAccommodationCollection(tripId);
  const snapshot = await getDocs(colRef);
  const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return list[0] || null;
}

/**
 * Mark a given member's share as paid.
 */
export async function markAccommodationSharePaid(tripId, accommodationId, memberId) {
  const ref = doc(tripAccommodationCollection(tripId), accommodationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Accommodation not found');

  const data = snap.data();
  const shares = { ...(data.shares || {}) };
  if (!shares[memberId]) return;

  shares[memberId] = {
    ...shares[memberId],
    status: 'paid',
  };

  await updateDoc(ref, { shares });
}

