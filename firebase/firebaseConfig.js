// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXIQ7bXIS1wVxenaeZTql9f3WNig78XN8",
  authDomain: "aishortcut-20e54.firebaseapp.com",
  projectId: "aishortcut-20e54",
  storageBucket: "aishortcut-20e54.firebasestorage.app",
  messagingSenderId: "909260475551",
  appId: "1:909260475551:web:02109240c68148223fa6aa",
  measurementId: "G-09X2JS8D8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;