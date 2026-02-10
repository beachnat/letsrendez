import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { auth, signOut } from '../services/firebase';
import { subscribeToUserTrips } from '../services/trips';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUserTrips((tripsList) => {
      setTrips(tripsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.scrollWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        {...(Platform.OS === 'web' && { tabIndex: 0 })}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Trips</Text>
            {user && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
          </View>
          {user && (
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.8}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#356769" />
            <Text style={styles.loadingText}>Loading your trips...</Text>
          </View>
        ) : trips.length > 0 ? (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripEdit', { tripId: trip.id })}
              activeOpacity={0.88}
            >
              <Text style={styles.tripName}>{trip.name}</Text>
              <Text style={styles.tripDetail}>Group Size: {trip.groupSize} people</Text>
              <Text style={styles.tripDetail}>Budget: ${trip.budget} per person</Text>
              {trip.tripType && (
                <Text style={styles.tripDetail}>Trip type: {trip.tripType}</Text>
              )}
              {trip.destination && (
                <Text style={styles.tripDetail}>Destination: {trip.destination}</Text>
              )}
              {trip.startDate && (
                <Text style={styles.tripDetail}>Dates: {trip.startDate}{trip.endDate ? ` – ${trip.endDate}` : ''}</Text>
              )}
              {!trip.destination && (
                <Text style={styles.tripDetail}>No destination yet — get ideas or add one</Text>
              )}
              <View style={styles.statusRow}>
                <Text style={styles.status}>Status: {trip.status || 'Planning'}</Text>
              </View>
              <View style={styles.cardActions}>
                {trip.destination ? (
                  <TouchableOpacity style={styles.viewFlightsButton} onPress={() => navigation.navigate('Results', { tripId: trip.id, tripData: trip })} activeOpacity={0.88}>
                    <Text style={styles.viewFlightsText}>View flights</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.viewFlightsButton} onPress={() => navigation.navigate('DestinationIdeas', { tripId: trip.id })} activeOpacity={0.88}>
                      <Text style={styles.viewFlightsText}>Get destination ideas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editTripButton} onPress={() => navigation.navigate('TripEdit', { tripId: trip.id })} activeOpacity={0.88}>
                      <Text style={styles.editTripButtonText}>Edit trip</Text>
                    </TouchableOpacity>
                  </>
                )}
                <Text style={styles.tapHint}>Tap card to edit</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No trips yet</Text>
            <Text style={styles.emptySubtext}>Create your first trip to get started.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('TripCreation')}
          activeOpacity={0.88}
        >
          <Text style={styles.createButtonText}>+ Create New Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const cardShadow = Platform.select({
  web: {
    boxShadow: '0 4px 24px rgba(53, 103, 105, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
  },
  default: { elevation: 2 },
});

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' && { height: '100%', minHeight: 0 }),
  },
  container: {
    flex: 1,
    minHeight: 0, // ensure ScrollView can shrink and scroll on web
    backgroundColor: '#fbfcfb',
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
      maxHeight: 'calc(100vh - 120px)',
    }),
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 14,
    color: '#afae8f',
    fontWeight: '500',
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.4)',
    backgroundColor: '#ffffff',
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
      default: {},
    }),
  },
  signOutText: {
    color: '#1a3a3d',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.18)',
    ...cardShadow,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  tripName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  tripDetail: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 6,
    lineHeight: 22,
  },
  statusRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(175, 174, 143, 0.2)',
  },
  status: {
    fontSize: 13,
    color: '#356769',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardActions: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  viewFlightsButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#356769',
    borderRadius: 10,
    ...Platform.select({
      web: { boxShadow: '0 2px 10px rgba(53, 103, 105, 0.2)' },
      default: {},
    }),
  },
  viewFlightsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  editTripButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.5)',
    backgroundColor: '#ffffff',
  },
  editTripButtonText: {
    color: '#356769',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tapHint: {
    fontSize: 12,
    color: '#afae8f',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.2)',
    borderStyle: 'dashed',
    ...cardShadow,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a3a3d',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#afae8f',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.2)',
    ...cardShadow,
  },
  loadingText: {
    fontSize: 15,
    color: '#4a5568',
    marginTop: 14,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#356769',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        boxShadow: '0 4px 20px rgba(53, 103, 105, 0.22), 0 2px 8px rgba(0,0,0,0.06)',
      },
      default: { elevation: 3 },
    }),
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
