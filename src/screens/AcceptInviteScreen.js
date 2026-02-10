import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { acceptTripInvite } from '../services/trips';

export default function AcceptInviteScreen({ route, navigation }) {
  const tripId = route.params?.tripId;
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tripId) {
      navigation.replace('Dashboard');
    }
  }, [tripId, navigation]);

  const handleJoinTrip = async () => {
    if (!tripId) return;
    setJoining(true);
    setError(null);
    try {
      await acceptTripInvite(tripId);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname || '/');
      }
      navigation.replace('TripEdit', { tripId });
    } catch (err) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Could not join trip. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (!tripId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're invited</Text>
      <Text style={styles.subtitle}>
        You've been invited to join a group trip. Join to add your departure city and see flight options with the group.
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, joining && styles.buttonDisabled]}
        onPress={handleJoinTrip}
        disabled={joining}
        activeOpacity={0.88}
      >
        {joining ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Join trip</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace('Dashboard')}
        disabled={joining}
      >
        <Text style={styles.skipText}>Skip — go to My Trips</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfcfb',
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 340,
    lineHeight: 24,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#356769',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(53, 103, 105, 0.25)' },
      default: {},
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 14,
  },
  skipText: {
    color: '#afae8f',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
