import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  logInWithEmail,
  logInWithGoogle,
  logOutUser,
  onAuthChange,
  sendPasswordReset,
  signUpWithEmail,
  SignUpData,
  getAuthErrorMessage,
} from '../services/auth';
import { getUserProfile, listenToUserProfile } from '../services/firestore';
import { UserProfile } from '../types/fitness';
import { testFirestoreConnection } from '../services/firebaseConfig';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signUp: (data: SignUpData) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  // Listen to Auth State
  useEffect(() => {
    // Run connection sanity check
    testFirestoreConnection().catch(() => {});

    const unsubscribeAuth = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setProfileLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (e) {
          console.warn('Initial profile load error', e);
        } finally {
          setProfileLoading(false);
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for user profile document when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      return;
    }

    const unsubscribeProfile = listenToUserProfile(
      currentUser.uid,
      (profile) => {
        if (profile) {
          setUserProfile(profile);
        }
      },
      (err) => {
        console.warn('Profile listener error', err);
      }
    );

    return () => unsubscribeProfile();
  }, [currentUser]);

  const signUp = useCallback(async (data: SignUpData) => {
    setAuthError(null);
    try {
      await signUpWithEmail(data);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      await logInWithEmail(email, password);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const logInGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await logInWithGoogle();
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const logOut = useCallback(async () => {
    setAuthError(null);
    try {
      await logOutUser();
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) return;
    try {
      const p = await getUserProfile(currentUser.uid);
      if (p) setUserProfile(p);
    } catch (e) {
      console.warn('Profile refresh error', e);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        profileLoading,
        authError,
        clearAuthError,
        signUp,
        logIn,
        logInGoogle,
        logOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
