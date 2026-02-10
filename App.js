import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text, Platform, Image } from 'react-native';

// Services
import { onAuthStateChange, auth } from './src/services/firebase';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import AuthScreen from './src/screens/AuthScreen';
import TripCreationScreen from './src/screens/TripCreationScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TripEditScreen from './src/screens/TripEditScreen';
import DestinationIdeasScreen from './src/screens/DestinationIdeasScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AcceptInviteScreen from './src/screens/AcceptInviteScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingInviteTripId, setPendingInviteTripId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) setPendingInviteTripId(invite);
  }, []);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#356769" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={user && pendingInviteTripId ? 'AcceptInvite' : undefined}
          screenOptions={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#356769',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
              letterSpacing: 0.3,
            },
            headerLeftContainerStyle: {
              paddingRight: 0,
              marginRight: 0,
            },
            ...(user && {
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Dashboard')}
                  style={styles.headerLogoWrap}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('./assets/logos/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ),
            }),
          })}
        >
          {user ? (
            // User is signed in - show main app (open AcceptInvite first if they landed with ?invite=tripId)
            <>
              <Stack.Screen 
                name="TripCreation" 
                component={TripCreationScreen}
                options={({ navigation }) => ({
                  title: "Create Your Trip",
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Dashboard')}
                      style={styles.headerButton}
                    >
                      <Text style={styles.headerButtonText}>My Trips</Text>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen}
                options={{ title: "My Trips" }}
              />
              <Stack.Screen 
                name="TripEdit" 
                component={TripEditScreen}
                options={{ title: "Edit Trip" }}
              />
              <Stack.Screen
                name="DestinationIdeas"
                component={DestinationIdeasScreen}
                options={{ title: "Destination ideas" }}
              />
              <Stack.Screen 
                name="Results" 
                component={ResultsScreen}
                options={{ title: "Flight options" }}
              />
              <Stack.Screen
                name="AcceptInvite"
                component={AcceptInviteScreen}
                options={{ title: "Join trip" }}
                initialParams={{ tripId: pendingInviteTripId }}
              />
            </>
          ) : (
            // Not signed in - landing first, then auth
            <>
              <Stack.Screen 
                name="Landing" 
                component={LandingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Auth" 
                component={AuthScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbfcfb',
  },
  headerButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerLogoWrap: {
    paddingLeft: 12,
    paddingVertical: 0,
    justifyContent: 'center',
    height: 56,
  },
  headerLogo: {
    height: 56,
    width: 140,
  },
});
