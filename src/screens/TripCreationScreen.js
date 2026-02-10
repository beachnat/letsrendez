import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import AutocompleteInput from '../components/AutocompleteInput';
import { searchCities } from '../utils/cities';
import { searchCitiesWithApi } from '../services/flights';
import { createTrip } from '../services/trips';

const TRIP_TYPES = [
  'Spring Break',
  'Bachelor Party',
  'Bachelorette Party',
  'Family',
  'Friends',
  'Golf Trip',
];

// Follow-up questions by trip type for richer AI/destination suggestions later
const TRIP_TYPE_FOLLOW_UPS = {
  'Spring Break': [
    { id: 'vibe', label: 'What vibe?', type: 'chips', options: ['Beach', 'City', 'Mountains', 'Mix'] },
    { id: 'pace', label: 'How do you want to spend it?', type: 'chips', options: ['Party', 'Chill', 'Adventure', 'Mix'] },
    { id: 'notes', label: 'Anything else? (optional)', type: 'text', placeholder: 'e.g. must have nightlife, prefer all-inclusive' },
  ],
  'Bachelor Party': [
    { id: 'vibe', label: 'What kind of trip?', type: 'chips', options: ['Vegas-style', 'Beach', 'City', 'Outdoor'] },
    { id: 'notes', label: 'Any must-haves? (optional)', type: 'text', placeholder: 'e.g. golf, fishing, nightlife' },
  ],
  'Bachelorette Party': [
    { id: 'vibe', label: 'What kind of trip?', type: 'chips', options: ['Spa / chill', 'Beach', 'City', 'Wine / food'] },
    { id: 'notes', label: 'Any must-haves? (optional)', type: 'text', placeholder: 'e.g. pool, brunch spots, photo spots' },
  ],
  'Family': [
    { id: 'kids', label: 'Traveling with kids?', type: 'chips', options: ['Yes, young', 'Yes, teens', 'No kids', 'Mix of ages'] },
    { id: 'pace', label: 'Pace of the trip?', type: 'chips', options: ['Relaxed', 'Active', 'Mix'] },
    { id: 'notes', label: 'Anything else? (optional)', type: 'text', placeholder: 'e.g. kid-friendly activities, accessible' },
  ],
  'Friends': [
    { id: 'vibe', label: 'What vibe?', type: 'chips', options: ['Adventure', 'Chill', 'City', 'Beach', 'Mix'] },
    { id: 'notes', label: 'Any must-haves? (optional)', type: 'text', placeholder: 'e.g. good food, hiking, nightlife' },
  ],
  'Golf Trip': [
    { id: 'focus', label: 'Main focus?', type: 'chips', options: ['Golf only', 'Golf + beach', 'Golf + nightlife', 'Flexible'] },
    { id: 'notes', label: 'Anything else? (optional)', type: 'text', placeholder: 'e.g. course difficulty, resort vs condo' },
  ],
};

const STEPS = ['basics', 'details', 'budget', 'destination'];
const STEP_LABELS = {
  basics: 'Trip basics',
  details: 'A few more details',
  budget: 'Budget & dates',
  destination: 'Where to?',
};

export default function TripCreationScreen({ navigation }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [tripName, setTripName] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [tripType, setTripType] = useState(null);
  const [tripPreferences, setTripPreferences] = useState({});
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCode, setDestinationCode] = useState(null);
  const [destinationMode, setDestinationMode] = useState(null); // 'pick' | 'suggest'
  const [destinationHint, setDestinationHint] = useState(''); // optional: "beach", "Mexico", etc. for AI suggestions
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentStep = STEPS[stepIndex];
  const followUpQuestions = tripType ? (TRIP_TYPE_FOLLOW_UPS[tripType] || []) : [];

  const canProceedFromBasics = tripName.trim() && groupSize.trim() && tripType;
  const canProceedFromDetails = true;
  const canProceedFromBudget = budget.trim();
  const canProceedFromDestination = destinationMode === 'suggest' || (destinationMode === 'pick' && destination.trim());

  const goNext = () => {
    setError(null);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleCreateTrip();
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const setPreference = (id, value) => {
    setTripPreferences((prev) => ({ ...prev, [id]: value }));
  };

  const searchDestination = useCallback((q) => searchCitiesWithApi(q, searchCities), []);

  const handleCreateTrip = async () => {
    const finalDestination = destinationMode === 'pick' ? destination : '';
    const finalDestinationCode = destinationMode === 'pick' ? destinationCode : null;

    if (!tripName || !groupSize || !budget) {
      setError('Please fill in trip name, group size, and budget.');
      return;
    }
    if (destinationMode === 'pick' && !finalDestination) {
      setError('Please select a destination or choose "Suggest destinations for me".');
      return;
    }

    setSaving(true);
    setError(null);

    const tripData = {
      name: tripName.trim(),
      groupSize: parseInt(groupSize, 10),
      budget: parseFloat(budget, 10),
      tripType: tripType || null,
      tripPreferences: Object.keys(tripPreferences).length ? tripPreferences : null,
      startDate: startDate || null,
      endDate: endDate || null,
      destination: finalDestination || null,
      destinationCode: finalDestinationCode || null,
      destinationHint: (destinationMode === 'suggest' && destinationHint.trim()) ? destinationHint.trim() : null,
    };

    try {
      const tripId = await createTrip(tripData);
      if (finalDestination) {
        navigation.navigate('Results', { tripId, tripData });
      } else {
        navigation.navigate('TripEdit', { tripId, fromCreate: true, destinationHint: tripData.destinationHint });
      }
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.message || 'Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderBasics = () => (
    <>
      <Text style={styles.stepTitle}>What kind of trip is this?</Text>
      <Text style={styles.stepSubtitle}>We'll use this to tailor suggestions and ask a couple quick questions.</Text>

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

      <Text style={styles.label}>Trip Type *</Text>
      <View style={styles.chipsRow}>
        {TRIP_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, tripType === type && styles.chipSelected]}
            onPress={() => setTripType(tripType === type ? null : type)}
          >
            <Text style={[styles.chipText, tripType === type && styles.chipTextSelected]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderDetails = () => (
    <>
      <Text style={styles.stepTitle}>A few more details</Text>
      <Text style={styles.stepSubtitle}>This helps us suggest better destinations and options later.</Text>

      {followUpQuestions.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.label}>{q.label}</Text>
          {q.type === 'chips' && (
            <View style={styles.chipsRow}>
              {(q.options || []).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, tripPreferences[q.id] === opt && styles.chipSelected]}
                  onPress={() => setPreference(q.id, tripPreferences[q.id] === opt ? undefined : opt)}
                >
                  <Text style={[styles.chipText, tripPreferences[q.id] === opt && styles.chipTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {q.type === 'text' && (
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder={q.placeholder || 'Optional'}
              value={tripPreferences[q.id] || ''}
              onChangeText={(text) => setPreference(q.id, text.trim() || undefined)}
              placeholderTextColor="#999"
              multiline
            />
          )}
        </View>
      ))}

      {followUpQuestions.length === 0 && (
        <Text style={styles.mutedText}>No extra questions for this trip type — you're good to go.</Text>
      )}
    </>
  );

  const renderBudget = () => (
    <>
      <Text style={styles.stepTitle}>Budget & dates</Text>
      <Text style={styles.stepSubtitle}>We'll find options that fit your budget per person.</Text>

      <Text style={styles.label}>Budget per Person ($) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 800"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

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
    </>
  );

  const renderDestination = () => (
    <>
      <Text style={styles.stepTitle}>Where do you want to go?</Text>
      <Text style={styles.stepSubtitle}>Destination is optional. Get AI destination ideas, or pick a specific place.</Text>

      <View style={styles.destinationModeRow}>
        <TouchableOpacity
          style={[styles.modeCard, destinationMode === 'suggest' && styles.modeCardSelected]}
          onPress={() => { setDestinationMode('suggest'); setDestination(''); setDestinationCode(null); }}
        >
          <Text style={[styles.modeCardTitle, destinationMode === 'suggest' && styles.modeCardTitleSelected]}>Get destination ideas</Text>
          <Text style={styles.modeCardDesc}>We'll suggest places that match your trip type, budget, and preferences.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeCard, destinationMode === 'pick' && styles.modeCardSelected]}
          onPress={() => setDestinationMode('pick')}
        >
          <Text style={[styles.modeCardTitle, destinationMode === 'pick' && styles.modeCardTitleSelected]}>I have a place in mind</Text>
          <Text style={styles.modeCardDesc}>Search flights and options for a specific destination.</Text>
        </TouchableOpacity>
      </View>

      {destinationMode === 'suggest' && (
        <>
          <Text style={styles.label}>Anything in mind? (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. beach, Mexico, good nightlife"
            value={destinationHint}
            onChangeText={setDestinationHint}
            placeholderTextColor="#999"
          />
        </>
      )}

      {destinationMode === 'pick' && (
        <>
          <Text style={styles.label}>Destination</Text>
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
        </>
      )}
    </>
  );

  const canProceed = () => {
    if (currentStep === 'basics') return canProceedFromBasics;
    if (currentStep === 'details') return canProceedFromDetails;
    if (currentStep === 'budget') return canProceedFromBudget;
    if (currentStep === 'destination') return canProceedFromDestination;
    return false;
  };

  const getNextButtonLabel = () => {
    if (currentStep === 'destination') return saving ? null : 'Create trip';
    return 'Continue';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              i <= stepIndex && styles.progressDotActive,
              i === stepIndex && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEP_LABELS[currentStep]}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {currentStep === 'basics' && renderBasics()}
          {currentStep === 'details' && renderDetails()}
          {currentStep === 'budget' && renderBudget()}
          {currentStep === 'destination' && renderDestination()}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonRow}>
            {stepIndex > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                (!canProceed() || saving) && styles.buttonDisabled,
                stepIndex > 0 && styles.buttonFlex,
              ]}
              onPress={goNext}
              disabled={!canProceed() || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>{getNextButtonLabel()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Brand: #356769 primary, #fbfcfb background, #c6a77a accent, #afae8f secondary — modern, classy
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfcfb',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(175, 174, 143, 0.4)',
  },
  progressDotActive: {
    backgroundColor: '#afae8f',
  },
  progressDotCurrent: {
    backgroundColor: '#356769',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#356769',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.2)',
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        boxShadow: '0 4px 24px rgba(53, 103, 105, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
      },
      default: { elevation: 2 },
    }),
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 22,
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a3a3d',
    marginBottom: 8,
    marginTop: 18,
    letterSpacing: 0.2,
  },
  questionBlock: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.35)',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fbfcfb',
    color: '#1a3a3d',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginHorizontal: -4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fbfcfb',
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.4)',
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: '#356769',
    borderColor: '#356769',
  },
  chipText: {
    fontSize: 14,
    color: '#1a3a3d',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  mutedText: {
    fontSize: 14,
    color: '#afae8f',
    fontStyle: 'italic',
    marginTop: 18,
    lineHeight: 20,
  },
  destinationModeRow: {
    gap: 14,
  },
  modeCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.3)',
    backgroundColor: '#fbfcfb',
  },
  modeCardSelected: {
    borderColor: '#356769',
    backgroundColor: 'rgba(53, 103, 105, 0.06)',
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  modeCardTitleSelected: {
    color: '#356769',
  },
  modeCardDesc: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 21,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.5)',
    backgroundColor: '#ffffff',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#356769',
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#356769',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 26,
    alignItems: 'center',
    minWidth: 140,
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(53, 103, 105, 0.25)' },
      default: {},
    }),
  },
  buttonFlex: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
});
