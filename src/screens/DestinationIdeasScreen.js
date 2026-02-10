import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { auth } from '../services/firebase';
import {
  getTrip,
  getDestinationSuggestions,
  likeDestinationSuggestion,
  updateTrip,
} from '../services/trips';

const COST_TIER_LABELS = { under: 'Under budget', at: 'On budget', over: 'Over budget' };

function getLikedByLabel(likedByUids, currentUid) {
  if (!likedByUids || likedByUids.length === 0) return null;
  const count = likedByUids.length;
  const iLike = currentUid && likedByUids.includes(currentUid);
  if (iLike && count === 1) return 'You like this';
  if (iLike && count === 2) return 'You and 1 other like this';
  if (iLike && count > 2) return `You and ${count - 1} others like this`;
  if (count === 1) return '1 member likes this';
  return `${count} members like this`;
}

export default function DestinationIdeasScreen({ route, navigation }) {
  const { tripId } = route.params || {};
  const userId = auth.currentUser?.uid;

  const [trip, setTrip] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [error, setError] = useState(null);
  const [likingCode, setLikingCode] = useState(null);
  const [selectingCode, setSelectingCode] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrip = useCallback(async () => {
    if (!tripId) return null;
    const t = await getTrip(tripId);
    setTrip(t);
    return t;
  }, [tripId]);

  const fetchSuggestions = useCallback(
    async (t) => {
      const tripData = t || trip;
      if (!tripData || !tripId) {
        setLoadingSuggestions(false);
        return;
      }
      setError(null);
      setLoadingSuggestions(true);
      const memberOrigins = {};
      const mo = tripData.memberOrigins || {};
      Object.keys(mo).forEach((uid) => {
        const code = mo[uid]?.departureCode;
        if (code) memberOrigins[uid] = code;
      });
      try {
        const result = await getDestinationSuggestions({
          tripId,
          tripType: tripData.tripType || 'Friends',
          budgetPerPerson: Number(tripData.budget) || 0,
          groupSize: Number(tripData.groupSize) || 1,
          departureDate: tripData.startDate || '',
          returnDate: tripData.endDate || '',
          memberOrigins,
          destinationHint: tripData.destinationHint || undefined,
          limit: 5,
        });
        if (result.error) {
          setError(result.error);
          setSuggestions([]);
        } else {
          setSuggestions(result.suggestions || []);
        }
      } catch (err) {
        setError(err.message || 'Could not load suggestions');
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [tripId, trip]
  );

  useEffect(() => {
    let cancelled = false;
    loadTrip().then((t) => {
      if (cancelled || !t) {
        if (!t) setLoadingTrip(false);
        return;
      }
      setLoadingTrip(false);
      fetchSuggestions(t);
    });
    return () => { cancelled = true; };
  }, [tripId]);

  const onRefresh = async () => {
    setRefreshing(true);
    const t = await loadTrip();
    await fetchSuggestions(t);
    setRefreshing(false);
  };

  const handleLike = async (iataCode, currentlyLiked) => {
    if (!tripId || likingCode) return;
    setLikingCode(iataCode);
    try {
      await likeDestinationSuggestion(tripId, iataCode, !currentlyLiked);
      const updated = await getTrip(tripId);
      setTrip(updated);
    } catch (err) {
      setError(err.message || 'Could not update like');
    } finally {
      setLikingCode(null);
    }
  };

  const handleSelectDestination = async (suggestion) => {
    if (!tripId || selectingCode) return;
    setSelectingCode(suggestion.iataCode);
    setError(null);
    try {
      await updateTrip(tripId, {
        destination: suggestion.name,
        destinationCode: suggestion.iataCode,
      });
      const updated = await getTrip(tripId);
      navigation.navigate('Results', { tripId, tripData: updated });
    } catch (err) {
      setError(err.message || 'Could not set destination');
      setSelectingCode(null);
    }
  };

  if (loadingTrip) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#356769" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Trip not found.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#356769']} />
      }
    >
      <Text style={styles.title}>Destination ideas</Text>
      <Text style={styles.subtitle}>
        Based on your trip type, budget, and dates. Like the ones you're into so your group can see.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loadingSuggestions ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#356769" />
          <Text style={styles.loadingLabel}>Finding places for you...</Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {error ? 'Try again or pick a destination in Edit Trip.' : 'No suggestions right now. Try again or add a destination in Edit Trip.'}
          </Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {suggestions.map((s) => {
            const likedBy = (trip.suggestionLikes || {})[s.iataCode] || [];
            const iLike = userId && likedBy.includes(userId);
            const likeLabel = getLikedByLabel(likedBy, userId);
            const isLiking = likingCode === s.iataCode;
            const isSelecting = selectingCode === s.iataCode;

            return (
              <View key={s.iataCode} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{s.name}</Text>
                  <View style={[styles.costTierBadge, styles[`costTier_${s.costTier}`]]}>
                    <Text style={styles.costTierText}>{COST_TIER_LABELS[s.costTier] || s.costTier}</Text>
                  </View>
                </View>
                {s.blurb ? <Text style={styles.cardBlurb}>{s.blurb}</Text> : null}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.likeButton, iLike && styles.likeButtonActive]}
                    onPress={() => handleLike(s.iataCode, iLike)}
                    disabled={isLiking}
                  >
                    {isLiking ? (
                      <ActivityIndicator size="small" color="#356769" />
                    ) : (
                      <Text style={styles.likeIcon}>{iLike ? '♥' : '♡'}</Text>
                    )}
                    <Text style={[styles.likeLabel, iLike && styles.likeLabelActive]}>
                      {iLike ? 'Liked' : 'Like'}
                    </Text>
                  </TouchableOpacity>
                  {likeLabel ? (
                    <Text style={styles.likedByText}>{likeLabel}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[styles.pickButton, isSelecting && styles.buttonDisabled]}
                  onPress={() => handleSelectDestination(s)}
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.pickButtonText}>Pick this destination</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Back to trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbfcfb' },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fbfcfb' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 20,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loadingLabel: { fontSize: 15, color: '#4a5568' },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#4a5568', textAlign: 'center', lineHeight: 22 },
  cardList: { gap: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.25)',
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(53, 103, 105, 0.08)' },
      default: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a3d',
    flex: 1,
    letterSpacing: 0.2,
  },
  costTierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  costTier_under: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  costTier_at: { backgroundColor: 'rgba(53, 103, 105, 0.12)' },
  costTier_over: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  costTierText: { fontSize: 12, fontWeight: '600', color: '#1a3a3d' },
  cardBlurb: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fbfcfb',
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.4)',
  },
  likeButtonActive: {
    borderColor: '#356769',
    backgroundColor: 'rgba(53, 103, 105, 0.08)',
  },
  likeIcon: { fontSize: 16, color: '#afae8f' },
  likeLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  likeLabelActive: { color: '#356769' },
  likedByText: { fontSize: 13, color: '#afae8f', fontStyle: 'italic' },
  pickButton: {
    backgroundColor: '#356769',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
  button: {
    backgroundColor: '#356769',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backLink: { marginTop: 24, alignSelf: 'center', paddingVertical: 8 },
  backLinkText: { fontSize: 15, fontWeight: '600', color: '#356769' },
});
