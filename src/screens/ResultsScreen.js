import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { auth } from '../services/firebase';
import { searchFlights, searchCitiesWithApi } from '../services/flights';
import { getTrip, updateMyOrigin } from '../services/trips';
import { getDestinationCode } from '../utils/flightCodes';
import AutocompleteInput from '../components/AutocompleteInput';
import { searchCities } from '../utils/cities';

function formatDuration(duration) {
  if (!duration) return '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = parseInt(match[1] || 0, 10);
  const mins = parseInt(match[2] || 0, 10);
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  if (mins) return `${mins}m`;
  return duration;
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function parseOriginCode(departureCity) {
  if (!departureCity || typeof departureCity !== 'string') return null;
  const match = departureCity.match(/\(([A-Z]{3})\)/i);
  return match ? match[1].toUpperCase() : null;
}

export default function ResultsScreen({ route, navigation }) {
  const tripId = route.params?.tripId;
  const initialTripData = route.params?.tripData || {};
  const [trip, setTrip] = useState(initialTripData);
  const [tripLoaded, setTripLoaded] = useState(!tripId);
  const [flights, setFlights] = useState([]);
  const [searchUrl, setSearchUrl] = useState(null);
  const [loading, setLoading] = useState(!!tripId);
  const [error, setError] = useState(null);
  const [departureCity, setDepartureCity] = useState('');
  const [savingOrigin, setSavingOrigin] = useState(false);

  const userId = auth.currentUser?.uid;
  const myOrigin = (trip.memberOrigins && userId && trip.memberOrigins[userId])
    ? trip.memberOrigins[userId]
    : null;
  const originCode = myOrigin?.departureCode || parseOriginCode(departureCity);
  const destinationCode = trip.destinationCode || getDestinationCode(trip.destination);
  const hasDestinationAndDate = destinationCode && trip.startDate;
  const needsOrigin = hasDestinationAndDate && !myOrigin;

  useEffect(() => {
    if (!tripId) {
      setTripLoaded(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getTrip(tripId).then((t) => {
      if (cancelled) return;
      if (t) setTrip(t);
      setTripLoaded(true);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tripId]);

  useEffect(() => {
    if (!hasDestinationAndDate || needsOrigin) return;
    const code = myOrigin?.departureCode || originCode;
    if (!code) return;

    let cancelled = false;
    setLoading(true);
    searchFlights({
      originCode: code,
      destinationCode,
      departureDate: trip.startDate,
      returnDate: trip.endDate || null,
      adults: trip.groupSize || 1,
    }).then((result) => {
      if (cancelled) return;
      setFlights(result.flights || []);
      setSearchUrl(result.searchUrl || null);
      setError(result.error || null);
      setLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Search failed');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [hasDestinationAndDate, needsOrigin, myOrigin?.departureCode, originCode, destinationCode, trip.startDate, trip.endDate, trip.groupSize]);

  const handleSetOrigin = async () => {
    const code = parseOriginCode(departureCity);
    if (!departureCity || !code) {
      alert('Please select a city with an airport code (e.g. Los Angeles (LAX))');
      return;
    }
    if (!tripId) return;
    setSavingOrigin(true);
    try {
      await updateMyOrigin(tripId, departureCity, code);
      setTrip((prev) => ({
        ...prev,
        memberOrigins: { ...(prev.memberOrigins || {}), [userId]: { departureCity, departureCode: code } },
      }));
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSavingOrigin(false);
    }
  };

  const openSearchUrl = () => {
    if (searchUrl) Linking.openURL(searchUrl);
  };

  const searchOrigin = useCallback((q) => searchCitiesWithApi(q, searchCities), []);

  if (!tripLoaded) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#356769" />
        <Text style={styles.loadingText}>Loading trip...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{trip.name || 'Trip'}</Text>
      <Text style={styles.subtitle}>
        {trip.destination ? `Flying to ${trip.destination}` : 'Flight options'}
      </Text>

      {!hasDestinationAndDate && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            This trip needs a destination and start date to search flights. Edit the trip to add them.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to trip</Text>
          </TouchableOpacity>
        </View>
      )}

      {needsOrigin && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Set your departure city so we can find flights from your location to the trip destination.
          </Text>
          <AutocompleteInput
            value={departureCity}
            onChangeText={setDepartureCity}
            placeholder="e.g., Charleston (CHS) or New York (JFK)"
            searchFunction={searchOrigin}
            onSelect={(city) => {
              setDepartureCity(city.fullName);
            }}
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonTop]}
            onPress={handleSetOrigin}
            disabled={savingOrigin}
          >
            {savingOrigin ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save & search flights</Text>}
          </TouchableOpacity>
        </View>
      )}

      {hasDestinationAndDate && !needsOrigin && loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#356769" />
          <Text style={styles.loadingText}>Searching flights...</Text>
        </View>
      )}

      {hasDestinationAndDate && !needsOrigin && !loading && error && (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>{error}</Text>
          {searchUrl && (
            <TouchableOpacity style={styles.button} onPress={openSearchUrl}>
              <Text style={styles.buttonText}>See flights on Kayak</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {hasDestinationAndDate && !needsOrigin && !loading && !error && (
        <>
          {flights.length === 0 ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>No flights found for these dates. Try different dates or check the link below.</Text>
              {searchUrl && (
                <TouchableOpacity style={styles.button} onPress={openSearchUrl}>
                  <Text style={styles.buttonText}>Search on Kayak</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {flights.map((f) => (
                <View key={f.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.price}>${f.price}</Text>
                    <Text style={styles.currency}>{f.currency}</Text>
                  </View>
                  {(f.airlineName || f.carrierCode) && (
                    <Text style={styles.airline}>
                      {f.airlineName || f.carrierCode}
                    </Text>
                  )}
                  <Text style={styles.route}>
                    {f.departure} → {f.arrival}
                  </Text>
                  <Text style={styles.time}>
                    {formatTime(f.departureTime)} – {formatTime(f.arrivalTime)}
                    {f.duration ? ` · ${formatDuration(f.duration)}` : ''}
                  </Text>
                  {(f.searchUrl || searchUrl) && (
                    <TouchableOpacity
                      style={styles.cardLink}
                      onPress={() => Linking.openURL(f.searchUrl || searchUrl)}
                    >
                      <Text style={styles.cardLinkText}>View on Kayak</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {searchUrl && (
                <TouchableOpacity style={styles.primaryButton} onPress={openSearchUrl}>
                  <Text style={styles.primaryButtonText}>See all options on Kayak</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.secondaryButtonText}>Back to My Trips</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfcfb',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a3a3d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#356769',
    marginBottom: 20,
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#afae8f',
  },
  messageText: {
    fontSize: 16,
    color: '#1a3a3d',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    marginBottom: 16,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#afae8f',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1a3a3d',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#afae8f',
    ...Platform.select({ web: { maxWidth: 600 } }),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a3a3d',
  },
  currency: {
    fontSize: 14,
    color: '#356769',
    marginLeft: 6,
  },
  airline: {
    fontSize: 14,
    color: '#356769',
    fontWeight: '600',
    marginBottom: 4,
  },
  route: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3a3d',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#afae8f',
  },
  cardLink: {
    marginTop: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  cardLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#356769',
  },
  button: {
    backgroundColor: '#356769',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
  },
  buttonTop: {
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#356769',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#356769',
    fontSize: 16,
    fontWeight: '700',
  },
});
