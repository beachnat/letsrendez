import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { signInWithGoogle } from '../services/firebase';

export default function AuthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logos/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Let's Rendez</Text>
        <Text style={styles.subtitle}>Group travel, elevated</Text>

        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                {Platform.OS === 'web' ? (
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                ) : (
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                )}
              </>
            )}
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Text style={styles.disclaimer}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#356769',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 36,
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(198, 167, 122, 0.95)',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  authContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: { elevation: 6 },
    }),
  },
  googleButton: {
    backgroundColor: '#356769',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 52,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(53, 103, 105, 0.3)',
      },
      default: { elevation: 2 },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#afae8f',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});
