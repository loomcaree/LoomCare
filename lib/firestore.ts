import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from './firebase-auth';

let _db: Firestore | undefined;

function getDb(): Firestore {
  if (!_db) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _db = getFirestore(app);
  }
  return _db;
}

// ─── User document ─────────────────────────────────────────────────────────

export interface UserDoc {
  email: string;
  displayName: string;
  signupMethod: 'email' | 'google+email';
  createdAt: unknown; // Firestore Timestamp
}

export async function createUserDoc(
  uid: string,
  email: string,
  signupMethod: 'email' | 'google+email',
  displayName = '',
): Promise<void> {
  await setDoc(doc(getDb(), 'users', uid), {
    email: email.toLowerCase(),
    displayName: displayName.trim(),
    signupMethod,
    createdAt: serverTimestamp(),
  });
}

// ─── Waitlist document ─────────────────────────────────────────────────────

export interface WaitlistDoc {
  fullName: string;
  phone: string;
  city: string;
  timeAlone: string;
  marketingConsent: boolean;
  requestId: string;
  submittedAt: unknown; // Firestore Timestamp
}

/** Returns the waitlist doc or null if the user hasn't submitted the form yet. */
export async function getWaitlistDoc(uid: string): Promise<WaitlistDoc | null> {
  const snap = await getDoc(doc(getDb(), 'waitlist', uid));
  return snap.exists() ? (snap.data() as WaitlistDoc) : null;
}

/** Persists waitlist details. Idempotent — safe to call multiple times. */
export async function saveWaitlistDetails(
  uid: string,
  data: Omit<WaitlistDoc, 'submittedAt'>,
): Promise<void> {
  await setDoc(doc(getDb(), 'waitlist', uid), {
    ...data,
    submittedAt: serverTimestamp(),
  });
}
