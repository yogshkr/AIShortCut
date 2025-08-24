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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Module-scoped singleton
let authInstance
export const auth = (() => {
if (!authInstance) {
authInstance = initializeAuth(app, {
persistence: getReactNativePersistence(AsyncStorage),
})
}
return authInstance
})()

export const db = getFirestore(app)
export default app