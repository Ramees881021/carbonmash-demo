import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5qXgnTBGY5I8Je3ELSIYTzuV-ZzedK1M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carbonmash-5c5cc.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://carbonmash-5c5cc-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carbonmash-5c5cc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carbonmash-5c5cc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "915752753839",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:915752753839:web:4e1691c2858f3dbc1c525a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FVS5062LLS"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
