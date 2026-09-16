import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDys2LFNAbijsk7Wad8QpNr8c4fi2k70Nw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carbonmash-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://carbonmash-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carbonmash-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carbonmash-demo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "410374940004",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:410374940004:web:886dcd55f91a1735490671",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RD88PCRVVS"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
