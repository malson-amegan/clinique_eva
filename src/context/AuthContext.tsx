import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import type { UserProfile } from '../types';

function getGoogleSignInError(err: unknown): string {
  const code =
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof err.code === 'string'
      ? err.code
      : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return "Ce domaine n'est pas autorisé dans Firebase Authentication. Ajoutez localhost dans les domaines autorisés du projet Firebase.";
    case 'auth/operation-not-allowed':
      return "La connexion Google n'est pas activée dans Firebase Authentication.";
    case 'auth/popup-blocked':
      return 'Le navigateur a bloqué la fenêtre Google. Autorisez les fenêtres pop-up puis réessayez.';
    case 'auth/network-request-failed':
      return 'La connexion à Firebase a échoué. Vérifiez votre connexion Internet.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    default:
      return code
        ? `La connexion Google a échoué (${code}). Vérifiez la configuration Firebase Authentication.`
        : 'La connexion Google a échoué. Vérifiez la configuration Firebase Authentication.';
  }
}

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  apiFetch: <T = unknown>(url: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiFetch = useCallback(
    async <T = unknown,>(url: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers);
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }
      return data as T;
    },
    []
  );

  const syncProfile = useCallback(
    async (user: User | null) => {
      if (!user) {
        setProfile(null);
        setAuthError(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/patient/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setAuthError(null);
        } else {
          const err = await res.json().catch(() => ({}));
          setAuthError(err.error || 'Impossible de charger votre profil.');
          setProfile(null);
        }
      } catch {
        setProfile(null);
        setAuthError('Erreur de connexion au serveur.');
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await syncProfile(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [syncProfile]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      await syncProfile(cred.user);
    } catch (err: unknown) {
      setAuthError(getGoogleSignInError(err) || null);
    }
  }, [syncProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await syncProfile(auth.currentUser);
  }, [syncProfile]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        refreshProfile,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  }
  return ctx;
}
