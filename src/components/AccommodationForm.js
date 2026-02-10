import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { auth } from '../services/firebase';
import {
  createTripAccommodation,
  getTripAccommodation,
  markAccommodationSharePaid,
} from '../services/accommodation';
import TripAccommodationCard from './TripAccommodationCard';

export default function AccommodationForm({ tripId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accommodation, setAccommodation] = useState(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const existing = await getTripAccommodation(tripId);
        if (cancelled) return;
        setAccommodation(existing);
        if (existing) {
          setTitle(existing.title || '');
          setLink(existing.link || '');
          setAddress(existing.address || '');
          setStartDate(existing.startDate || '');
          setEndDate(existing.endDate || '');
          setTotalAmount(
            existing.totalAmount != null ? String(existing.totalAmount) : ''
          );
          setCurrency(existing.currency || 'USD');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not load accommodation');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const handleSave = async () => {
    if (!title || !totalAmount) {
      alert('Please add a name and total amount for the stay.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createTripAccommodation(tripId, {
        title,
        link,
        address,
        startDate,
        endDate,
        totalAmount: Number(totalAmount),
        currency,
        participants: [currentUser && currentUser.uid].filter(Boolean),
        splitType: 'even',
      });
      const updated = await getTripAccommodation(tripId);
      setAccommodation(updated);
    } catch (e) {
      setError(e.message || 'Failed to save accommodation');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (memberId) => {
    if (!accommodation || !accommodation.id) return;
    try {
      await markAccommodationSharePaid(tripId, accommodation.id, memberId);
      const updated = await getTripAccommodation(tripId);
      setAccommodation(updated);
    } catch (e) {
      alert('Failed to mark as paid. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#356769" />
        <Text style={styles.loadingText}>Loading accommodation…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Accommodation & costs</Text>

      <TripAccommodationCard
        accommodation={accommodation}
        currentUserId={currentUser && currentUser.uid}
        onMarkPaidPress={handleMarkPaid}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Accommodation name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Lisbon Airbnb in Alfama"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Booking link</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste Airbnb / Booking / VRBO link"
          value={link}
          onChangeText={setLink}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Address for check-in, Uber, etc."
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Start date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>End date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Total paid for this stay</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 1200"
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          placeholder="USD"
          value={currency}
          onChangeText={setCurrency}
          placeholderTextColor="#999"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {accommodation ? 'Update accommodation' : 'Save accommodation'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 8,
  },
  form: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#afae8f',
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3a3d',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#afae8f',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fbfcfb',
    color: '#1a3a3d',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: '#356769',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    marginTop: 10,
    color: '#b91c1c',
    fontSize: 13,
  },
  loading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#4a5568',
    fontSize: 14,
  },
});

