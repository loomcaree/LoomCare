'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  logOut: async () => {},
  authError: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!mounted) return;
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase Auth state listener error:', error);
        if (!mounted) return;
        setLoading(false);
      },
    );
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle(): Promise<User | null> {
    setAuthError(null);
    if (!auth || typeof auth.name === 'undefined') {
      const msg = 'Firebase keys are not configured yet in .env.local. You can test manual entry below or add keys to enable live Google Auth.';
      setAuthError(msg);
      return null;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      return result.user;
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        // User closed popup; no error message needed
        return null;
      }
      if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
        const msg = 'Firebase API key in .env.local is missing or invalid. Please check your Firebase Console keys.';
        setAuthError(msg);
        return null;
      }
      const message =
        error instanceof Error ? error.message : 'Unable to sign in with Google.';
      console.error('Google Sign-in error:', error);
      setAuthError(message);
      return null;
    }
  }

  async function logOut(): Promise<void> {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logOut,
        authError,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
