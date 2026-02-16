import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';

// Same content as landing/index.html – Coming Soon holding page (BRAND.md)
const EMAIL = 'hello@letsrendez.app';

export default function ComingSoonScreen({ navigation }) {
  const openEmail = () => Linking.openURL(`mailto:${EMAIL}`);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Let's Rendez</Text>
          <Text style={styles.tagline}>Group travel, elevated</Text>
          <Text style={styles.badge}>Coming soon</Text>
          <Text style={styles.body}>
            We help groups plan trips together—flights, stays, and activities in one place—without the chaos.
          </Text>
          <Text style={styles.footer}>
            For affiliate or partnership inquiries, contact{' '}
            <Text style={styles.link} onPress={openEmail}>
              {EMAIL}
            </Text>
            .
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backLinkText}>← Back to app</Text>
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
    paddingBottom: 48,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  container: {
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#afae8f',
    padding: 28,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(53, 103, 105, 0.08)',
      },
      default: { elevation: 2 },
    }),
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : undefined,
    fontWeight: '700',
    fontSize: 28,
    color: '#356769',
    textAlign: 'center',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#afae8f',
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c6a77a',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a3a3d',
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a3a3d',
    textAlign: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#afae8f',
  },
  link: {
    color: '#356769',
    fontWeight: '600',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  backLink: {
    marginTop: 24,
    padding: 12,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#356769',
  },
});
