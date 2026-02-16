import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { bookingAffiliateId, vrboAffiliateId, viatorPartnerId, viatorMcid } from '../config/affiliate';

/**
 * Simple screen to help the group decide between hotels vs rentals
 * and open the right search links (Booking.com / VRBO / Airbnb).
 *
 * Expects route.params: { tripId, destination, startDate, endDate, groupSize, under25?, stayPreference? }
 */
export default function AccommodationDiscoveryScreen({ route }) {
  const {
    destination,
    startDate,
    endDate,
    groupSize,
    under25,
  } = route.params || {};

  const guests = groupSize || 2;

  const bookingComUrl = useMemo(() => {
    if (!destination) return null;
    const params = new URLSearchParams();
    if (startDate) params.set('checkin', startDate);
    if (endDate) params.set('checkout', endDate);
    params.set('group_adults', guests || 2);
    params.set('no_rooms', 1);
    if (bookingAffiliateId) params.set('aid', bookingAffiliateId);
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      destination
    )}&${params.toString()}`;
  }, [destination, startDate, endDate, guests]);

  const vrboUrl = useMemo(() => {
    if (!destination) return null;
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    params.set('adults', guests || 2);
    if (vrboAffiliateId) params.set('affid', vrboAffiliateId);
    return `https://www.vrbo.com/search/keywords:${encodeURIComponent(
      destination
    )}?${params.toString()}`;
  }, [destination, startDate, endDate, guests]);

  const airbnbUrl = useMemo(() => {
    if (!destination) return null;
    const params = new URLSearchParams();
    if (startDate) params.set('checkin', startDate);
    if (endDate) params.set('checkout', endDate);
    params.set('adults', guests || 2);
    params.set('source', 'letsrendez');
    return `https://www.airbnb.com/s/${encodeURIComponent(
      destination
    )}/homes?${params.toString()}`;
  }, [destination, startDate, endDate, guests]);

  const viatorUrl = useMemo(() => {
    const base = 'https://www.viator.com';
    if (!viatorPartnerId) return base;
    const params = new URLSearchParams();
    params.set('pid', viatorPartnerId);
    params.set('medium', 'link');
    params.set('campaign', 'letsrendez');
    if (viatorMcid) params.set('mcid', viatorMcid);
    return `${base}?${params.toString()}`;
  }, []);

  const openUrl = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      alert('Unable to open link. You can copy and paste it into your browser.');
    });
  };

  const showUnder25Warning = !!under25;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        {...(Platform.OS === 'web' && { tabIndex: 0 })}
      >
        <Text style={styles.title}>Find a place to stay</Text>
        {destination ? (
          <Text style={styles.subtitle}>
            For your trip to <Text style={styles.subtitleHighlight}>{destination}</Text>
            {startDate ? ` (${startDate}${endDate ? ` – ${endDate}` : ''})` : ''}
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            Add a destination on your trip first for better suggestions.
          </Text>
        )}

        {showUnder25Warning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Heads up for under‑25 groups</Text>
            <Text style={styles.warningText}>
              Hotels are usually easier to book if anyone in your group is under 25.
              Some rentals (and most car rentals) have 21+ or 25+ age rules, so double‑check
              the listing and policies.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hotels</Text>
          <Text style={styles.sectionText}>
            Great for under‑25 groups and quick trips. No host age rules, clear policies,
            and easy cancellations in many cases.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, !bookingComUrl && styles.ctaDisabled]}
            onPress={() => openUrl(bookingComUrl)}
            disabled={!bookingComUrl}
          >
            <Text style={styles.ctaText}>
              Browse hotels on Booking.com
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental homes</Text>
          <Text style={styles.sectionText}>
            More space and common areas for the group. Perfect for longer trips, but some
            hosts require guests to be 21+ or 25+, so check each listing.
          </Text>

          <TouchableOpacity
            style={[styles.secondaryButton, !vrboUrl && styles.ctaDisabled]}
            onPress={() => openUrl(vrboUrl)}
            disabled={!vrboUrl}
          >
            <Text style={styles.secondaryText}>Browse rentals on VRBO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, !airbnbUrl && styles.ctaDisabled]}
            onPress={() => openUrl(airbnbUrl)}
            disabled={!airbnbUrl}
          >
            <Text style={styles.secondaryText}>Browse homes on Airbnb</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Things to do</Text>
          <Text style={styles.sectionText}>
            Tours, activities, and experiences. When you have a destination, browse Viator for ideas.
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => openUrl(viatorUrl)}
          >
            <Text style={styles.secondaryText}>
              {destination ? `Browse activities in ${destination} on Viator` : 'Browse activities on Viator'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Once you’ve booked, paste your booking link back into the trip to share details
            with your group and track who owes what.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fbfcfb',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a3a3d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#356769',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitleHighlight: {
    fontWeight: '700',
  },
  warningBox: {
    backgroundColor: 'rgba(198,167,122,0.12)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c6a77a',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7b341e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#4a5568',
    lineHeight: 18,
  },
  section: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(175,174,143,0.4)',
    ...Platform.select({
      web: { boxShadow: '0 3px 16px rgba(53,103,105,0.08)' },
      default: { elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 18,
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#356769',
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fbfcfb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#afae8f',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryText: {
    color: '#356769',
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#afae8f',
    textAlign: 'center',
    lineHeight: 18,
  },
});

