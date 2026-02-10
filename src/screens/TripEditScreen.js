import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AutocompleteInput from '../components/AutocompleteInput';
import AccommodationForm from '../components/AccommodationForm';
import { searchCities } from '../utils/cities';
import { searchCitiesWithApi } from '../services/flights';
import { auth } from '../services/firebase';
import { getTrip, updateTrip, inviteMembersByEmail, getInviteLink } from '../services/trips';

const TRIP_TYPES = [
  'Spring Break',
  'Bachelor Party',
  'Bachelorette Party',
  'Family',
  'Friends',
  'Golf Trip',
];

function toInputValue(value) {
  if (value == null || value === undefined) return '';
  return String(value);
}

export default function TripEditScreen({ route, navigation }) {
  const { tripId, fromCreate } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tripName, setTripName] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [budget, setBudget] = useState('');
  const [tripType, setTripType] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCode, setDestinationCode] = useState(null);
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [createdBy, setCreatedBy] = useState(null);
  const [inviteInput, setInviteInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inviteSectionRef = useRef(null);
  const formYRef = useRef(0);
  const inviteSectionY = useRef(0);

  const scrollToInvite = () => {
    if (Platform.OS === 'web' && typeof inviteSectionRef.current?.scrollIntoView === 'function') {
      inviteSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollRef.current?.scrollTo) {
      scrollRef.current.scrollTo({ y: Math.max(0, inviteSectionY.current - 24), animated: true });
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!tripId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const trip = await getTrip(tripId);
        if (cancelled) return;
        if (!trip) {
          setNotFound(true);
        } else {
          setTripName(toInputValue(trip.name));
          setGroupSize(toInputValue(trip.groupSize));
          setBudget(toInputValue(trip.budget));
          setTripType(trip.tripType || null);
          setStartDate(toInputValue(trip.startDate));
          setEndDate(toInputValue(trip.endDate));
          setDestination(toInputValue(trip.destination));
          setDestinationCode(trip.destinationCode || null);
          setInvitedEmails(Array.isArray(trip.invitedEmails) ? trip.invitedEmails : []);
          setCreatedBy(trip.createdBy || null);
        }
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tripId]);

  const handleSave = async () => {
    if (!tripName || !groupSize || !budget) {
      alert('Please fill in trip name, group size, and budget');
      return;
    }

    setSaving(true);
    setError(null);

    const updates = {
      name: tripName,
      groupSize: parseInt(groupSize, 10),
      budget: parseFloat(budget, 10),
      tripType: tripType || null,
      startDate: startDate || null,
      endDate: endDate || null,
      destination: destination || null,
      destinationCode: destinationCode || null,
    };

    try {
      await updateTrip(tripId, updates);
      navigation.goBack();
    } catch (err) {
      console.error('Error updating trip:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isCreator = auth.currentUser && createdBy === auth.currentUser.uid;

  const handleCopyInviteLink = async () => {
    const link = getInviteLink(tripId);
    if (!link) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        alert('Invite link copied! Share it with your group.');
      } else {
        const { Clipboard } = require('react-native');
        if (Clipboard?.setString) {
          Clipboard.setString(link);
          alert('Invite link copied! Share it with your group.');
        } else {
          alert('Share this link: ' + link);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Share this link: ' + link);
    }
  };

  const handleSendInvites = async () => {
    const raw = inviteInput.replace(/\s+/g, ' ').split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
    const emails = [...new Set(raw)].filter((e) => e.includes('@'));
    if (emails.length === 0) {
      alert('Enter at least one valid email address.');
      return;
    }
    setInviting(true);
    setError(null);
    try {
      await inviteMembersByEmail(tripId, emails);
      setInvitedEmails((prev) => [...new Set([...prev, ...emails.map((e) => e.toLowerCase())])]);
      setInviteInput('');
    } catch (err) {
      setError(err.message || 'Failed to send invites.');
    } finally {
      setInviting(false);
    }
  };

  const searchDestination = useCallback((q) => searchCitiesWithApi(q, searchCities), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#356769" />
        <Text style={styles.loadingText}>Loading trip...</Text>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Trip not found or you don't have access.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to My Trips</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.scrollWrapper}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        {...(Platform.OS === 'web' && { tabIndex: 0 })}
      >
      <Text style={styles.title}>Edit Trip</Text>
      <Text style={styles.subtitle}>Update your trip details</Text>

      {fromCreate && (
        <View style={styles.createdBanner}>
          <Text style={styles.createdBannerText}>Trip created! Invite friends, then get destination ideas or pick a destination to view flights.</Text>
        </View>
      )}

      {isCreator && (
        <TouchableOpacity style={styles.inviteJumpLink} onPress={scrollToInvite}>
          <Text style={styles.inviteJumpLinkText}>Invite members ↓</Text>
        </TouchableOpacity>
      )}

      <View style={styles.form} onLayout={(e) => { formYRef.current = e.nativeEvent.layout.y; }}>
        <Text style={styles.label}>Trip Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Cabo Spring Break 2026"
          value={tripName}
          onChangeText={setTripName}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Group Size *</Text>
        <TextInput
          style={styles.input}
          placeholder="How many people?"
          value={groupSize}
          onChangeText={setGroupSize}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Budget per Person ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 800"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Destination {destination ? '' : '(optional — or get ideas below)'}</Text>
        <AutocompleteInput
          value={destination}
          onChangeText={(text) => { setDestination(text); setDestinationCode(null); }}
          placeholder="e.g., Cabo San Lucas or SJD"
          searchFunction={searchDestination}
          onSelect={(city) => {
            setDestination(city.fullName);
            setDestinationCode(city.code || null);
          }}
        />

        <Text style={styles.label}>Trip Type (optional)</Text>
        <View style={styles.chipsRow}>
          {TRIP_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, tripType === type && styles.chipSelected]}
              onPress={() => setTripType(tripType === type ? null : type)}
            >
              <Text style={[styles.chipText, tripType === type && styles.chipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Start Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (e.g., 2026-03-15)"
          value={startDate}
          onChangeText={setStartDate}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>End Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (e.g., 2026-03-22)"
          value={endDate}
          onChangeText={setEndDate}
          placeholderTextColor="#999"
        />

        <AccommodationForm tripId={tripId} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {!destination ? (
          <TouchableOpacity
            style={styles.destinationIdeasButton}
            onPress={() => navigation.navigate('DestinationIdeas', { tripId })}
          >
            <Text style={styles.destinationIdeasText}>Get destination ideas</Text>
            <Text style={styles.destinationIdeasSubtext}>We'll suggest places based on your trip type, budget & preferences. You and your group can like favorites.</Text>
          </TouchableOpacity>
        ) : null}

        {destination ? (
          <TouchableOpacity
            style={styles.viewFlightsButton}
            onPress={() => navigation.navigate('Results', { tripId, tripData: { name: tripName, groupSize: parseInt(groupSize, 10), budget: parseFloat(budget, 10), tripType: tripType || null, startDate: startDate || null, endDate: endDate || null, destination: destination || null, destinationCode: destinationCode || null } })}
          >
            <Text style={styles.viewFlightsText}>View flights</Text>
          </TouchableOpacity>
        ) : null}

        {isCreator && (
          <View
            style={styles.inviteSection}
            ref={inviteSectionRef}
            collapsable={false}
            onLayout={(e) => { inviteSectionY.current = formYRef.current + e.nativeEvent.layout.y; }}
          >
            <Text style={styles.inviteTitle}>Invite members</Text>
            <Text style={styles.inviteSubtext}>Share the link below or add emails. Friends can sign in and add their departure city for flights.</Text>
            <TouchableOpacity style={styles.copyLinkButton} onPress={handleCopyInviteLink}>
              <Text style={styles.copyLinkText}>Copy invite link</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="email@example.com, another@example.com"
              value={inviteInput}
              onChangeText={setInviteInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={[styles.inviteButton, inviting && styles.buttonDisabled]} onPress={handleSendInvites} disabled={inviting}>
              {inviting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send invite</Text>}
            </TouchableOpacity>
            {invitedEmails.length > 0 && (
              <Text style={styles.invitedLabel}>Invited: {invitedEmails.join(', ')}</Text>
            )}
          </View>
        )}
      </View>
      </ScrollView>
    </View>
  );
}

// Brand: #356769 primary, #fbfcfb background, #c6a77a accent, #afae8f secondary
const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' && { height: '100%', minHeight: 0 }),
  },
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#fbfcfb',
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
      maxHeight: 'calc(100vh - 120px)', // leave room for header so wheel scroll works
    }),
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  inviteJumpLink: {
    alignSelf: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  inviteJumpLinkText: {
    color: '#356769',
    fontSize: 15,
    fontWeight: '600',
  },
  createdBanner: {
    backgroundColor: 'rgba(53, 103, 105, 0.12)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#356769',
  },
  createdBannerText: {
    fontSize: 14,
    color: '#1a3a3d',
    lineHeight: 20,
  },
  destinationIdeasButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fbfcfb',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#c6a77a',
    borderStyle: 'dashed',
  },
  destinationIdeasText: {
    color: '#356769',
    fontSize: 16,
    fontWeight: '700',
  },
  destinationIdeasSubtext: {
    color: '#afae8f',
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1a3a3d',
  },
  notFoundText: {
    fontSize: 16,
    color: '#1a3a3d',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#356769',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a3a3d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#356769',
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#afae8f',
    ...Platform.select({
      web: { maxWidth: 600, alignSelf: 'center', width: '100%' },
    }),
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#afae8f',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fbfcfb',
    color: '#1a3a3d',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginHorizontal: -4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#fbfcfb',
    borderWidth: 1,
    borderColor: '#afae8f',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#356769',
    borderColor: '#356769',
  },
  chipText: {
    fontSize: 14,
    color: '#1a3a3d',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#356769',
    borderRadius: 6,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  viewFlightsButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#356769',
    borderRadius: 6,
    alignItems: 'center',
  },
  viewFlightsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  inviteSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#afae8f',
  },
  copyLinkButton: {
    backgroundColor: '#356769',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  copyLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 6,
  },
  inviteSubtext: {
    fontSize: 14,
    color: '#356769',
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: '#356769',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  invitedLabel: {
    fontSize: 13,
    color: '#afae8f',
    marginTop: 12,
  },
});
