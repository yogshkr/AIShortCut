// firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration from app config
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.apiKey,
  authDomain: Constants.expoConfig?.extra?.authDomain,
  projectId: Constants.expoConfig?.extra?.projectId,
  storageBucket: Constants.expoConfig?.extra?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.appId,
  measurementId: Constants.expoConfig?.extra?.measurementId,
};

// Ensure single app instance (handles hot reload / fast refresh)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence exactly once
let auth;
try {
  // If auth was already initialized elsewhere, this will throw; we fall back to getAuth-like retrieval
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth already initialized in this runtime (e.g., during hot reload).
  // In that case, use the default export from the initialized module.
  // We avoid importing getAuth to prevent mixing patterns; initializeAuth returns the same instance when first run.
  // eslint-disable-next-line global-require
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

// Firestore (safe to call multiple times; returns singleton per app)
const db = getFirestore(app);

// Basic validation in development
if (__DEV__) {
  if (!app) console.warn('Firebase App failed to initialize');
  if (!auth) console.warn('Firebase Auth failed to initialize');
  if (!db) console.warn('Firestore failed to initialize');
}

export { app as default, auth, db };
