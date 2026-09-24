import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';

// Public browser configuration from the existing loomcare Firebase web app.
// This identifies the project; it is NOT an admin credential or access rule.
export const firebaseConfig = {
  apiKey: 'AIzaSyAyGmPE1wYuVLlvLsG_1oetyKqK6Wvmrx4',
  authDomain: 'loom-care.firebaseapp.com',
  projectId: 'loom-care',
  appId: '1:1048638680655:web:136816f6d4e8cdd05c843a',
};

let auth: Auth | undefined;
export function getLoomAuth() {
  if (!auth) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
  return auth;
}

export { getAdditionalUserInfo };

export function isPreviouslySignedIn(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return Boolean(
      localStorage.getItem('loom_previously_signed_in') === 'true' ||
      localStorage.getItem('loom_waitlist_registered') ||
      localStorage.getItem('loom_last_signed_in_email') ||
      localStorage.getItem('loom_user_signed_in') === 'true'
    );
  } catch {
    return false;
  }
}

export function getPreviousEmail(): string {
  try {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('loom_last_signed_in_email') ||
      localStorage.getItem('loom_waitlist_registered') ||
      ''
    );
  } catch {
    return '';
  }
}

export function markSignedIn(email?: string | null) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem('loom_previously_signed_in', 'true');
    localStorage.setItem('loom_user_signed_in', 'true');
    if (email) {
      localStorage.setItem('loom_last_signed_in_email', email.toLowerCase());
    }
  } catch {
    // ignore
  }
}

export function markSignedOut() {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('loom_user_signed_in');
  } catch {
    // ignore
  }
}

export function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. You can try again whenever you’re ready.';
    case 'auth/popup-blocked':
      return 'Please allow popups for this site, then try again. If needed, open it in Safari or Chrome.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in isn’t available on this address yet. Contact loomcaree@gmail.com.';
    case 'auth/operation-not-allowed':
      return 'Email or Google sign-in isn’t enabled yet. Contact loomcaree@gmail.com.';
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Please sign in.';
    case 'auth/google-account-exists':
      return 'This email is registered with Google. Please continue with Google.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'We couldn’t sign you in. Check your email and password, or reset your password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Please check your internet connection and try again.';
    default:
      return error instanceof Error && error.message
        ? error.message
        : 'We couldn’t complete sign-in. Please try again or contact loomcaree@gmail.com.';
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const auth = getLoomAuth();
  const cleanEmail = email.trim();
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }
    markSignedIn(credential.user.email);
    return credential.user;
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : '';
    if (code === 'auth/email-already-in-use') {
      let methods: string[] = [];
      try {
        methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
      } catch {
        methods = [];
      }
      if (methods.includes('google.com') && !methods.includes('password')) {
        const err = new Error(authErrorMessage({ code: 'auth/google-account-exists' }));
        (err as unknown as { code: string }).code = 'auth/google-account-exists';
        throw err;
      }
      const err = new Error(authErrorMessage({ code: 'auth/email-already-in-use' }));
      (err as unknown as { code: string }).code = 'auth/email-already-in-use';
      throw err;
    }
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    getLoomAuth(),
    email.trim(),
    password,
  );
  markSignedIn(credential.user.email);
  return credential.user;
}

export async function sendWaitlistPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const err = new Error('Please enter a valid email address.');
    (err as unknown as { code: string }).code = 'auth/invalid-email';
    throw err;
  }
  try {
    const methods = await fetchSignInMethodsForEmail(getLoomAuth(), cleanEmail);
    if (methods.includes('google.com') && !methods.includes('password')) {
      const err = new Error(authErrorMessage({ code: 'auth/google-account-exists' }));
      (err as unknown as { code: string }).code = 'auth/google-account-exists';
      throw err;
    }
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : '';
    if (code === 'auth/google-account-exists') throw error;
  }
  await sendPasswordResetEmail(getLoomAuth(), cleanEmail);
}

/**
 * Links an email+password credential to an existing Google-authenticated user.
 * Call this after `signInWithPopup` for a brand-new Google account to enforce
 * the "every account must have a password" policy.
 */
export async function linkPasswordToGoogle(user: User, password: string): Promise<void> {
  const credential = EmailAuthProvider.credential(user.email!, password);
  await linkWithCredential(user, credential);
}

/** Signs out and clears all local auth hints. */
export async function loomSignOut(): Promise<void> {
  markSignedOut();
  await signOut(getLoomAuth());
}
