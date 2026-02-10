import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from 'react-native';

// Brand: #356769 primary, #fbfcfb background, #c6a77a accent, #afae8f secondary
// Modern, classy, slightly elegant

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/logos/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Let's Rendez</Text>
        <Text style={styles.tagline}>Group travel, elevated</Text>
        <Text style={styles.valueProp}>
          Plan trips together without the chaos. Flights, stays, and activities in one place—so everyone stays on the same page.
        </Text>

        <View style={styles.bullets}>
          <Text style={styles.bullet}>· Best flight options for your budget</Text>
          <Text style={styles.bullet}>· Hotels & vacation rentals for groups</Text>
          <Text style={styles.bullet}>· Who's booked, who's not—at a glance</Text>
          <Text style={styles.bullet}>· Split costs without the headache</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Auth')}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaButtonText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.signInLinkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fbfcfb',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 56,
  },
  container: {
    flex: 1,
    backgroundColor: '#fbfcfb',
    paddingHorizontal: 32,
    paddingTop: 64,
    alignItems: 'center',
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 28,
    opacity: 0.98,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1a3a3d',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c6a77a',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  valueProp: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  bullets: {
    alignSelf: 'stretch',
    marginBottom: 36,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(175, 174, 143, 0.2)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(53, 103, 105, 0.06), 0 1px 3px rgba(0,0,0,0.04)',
      },
      default: { elevation: 2 },
    }),
  },
  bullet: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a3a3d',
    marginBottom: 12,
    paddingLeft: 20,
    position: 'relative',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#356769',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(53, 103, 105, 0.25), 0 2px 6px rgba(0,0,0,0.06)',
      },
      default: { elevation: 3 },
    }),
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signInLink: {
    marginTop: 24,
    padding: 12,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#356769',
    letterSpacing: 0.2,
  },
});
