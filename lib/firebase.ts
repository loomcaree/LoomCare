import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const hasRealConfig = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForLocalPreview12345',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'loom-care-demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'loom-care-demo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'loom-care-demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '100000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:100000000000:web:demo1234567890',
};

export const isFirebaseConfigured = hasRealConfig;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
const googleProvider = new GoogleAuthProvider();

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialized in fallback mode:', error);
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig, 'demo-app');
    auth = getAuth(app);
    db = getFirestore(app);
  } catch {
    // Graceful fallback to prevent runtime crashes when keys are missing
    auth = {} as Auth;
    db = {} as Firestore;
    app = {} as FirebaseApp;
  }
}

export { app, auth, db, googleProvider };
