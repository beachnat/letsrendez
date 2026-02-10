// Firebase configuration
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBsalRyi2NylkyMXKM-ELCckMfAHItxGo",
  authDomain: "letsrendez.firebaseapp.com",
  projectId: "letsrendez",
  storageBucket: "letsrendez.firebasestorage.app",
  messagingSenderId: "746411749598",
  appId: "1:746411749598:web:3420d526102d7382f1124f",
  measurementId: "G-QJBCHHSXDF"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization error:', error);
  console.warn('Please add your Firebase config to src/services/firebase.js');
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      // Use popup on web for better UX
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } else {
      // On mobile, Firebase will handle native Google Sign-In
      // For Expo, you may need to use expo-auth-session or @react-native-google-signin/google-signin
      // For now, we'll use redirect as fallback
      await signInWithRedirect(auth, googleProvider);
      return null; // Will be handled by redirect
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { app, auth, db, googleProvider };
