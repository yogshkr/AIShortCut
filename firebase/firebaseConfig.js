import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Production Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXIQ7bXIS1wVxenaeZTql9f3WNig78XN8",
  authDomain: "aishortcut-20e54.firebaseapp.com",
  projectId: "aishortcut-20e54",
  storageBucket: "aishortcut-20e54.firebasestorage.app",
  messagingSenderId: "909260475551",
  appId: "1:909260475551:web:02109240c68148223fa6aa",
  measurementId: "G-09X2JS8D8E"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  // Silent error handling for production - could be logged to crash analytics
  if (__DEV__) {
    console.error('Firebase initialization error:', error);
  }
}

// Validate initialization
if (!app || !auth || !db) {
  throw new Error('Firebase services failed to initialize');
}

export { auth, db };
export default app;
