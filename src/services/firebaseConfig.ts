import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';

// Support both environment variables (ideal for Render / production) and firebase-applet-config.json
const env = import.meta.env;

export const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || configJson.projectId || 'sylvan-classifier-gpqwl',
  appId: env.VITE_FIREBASE_APP_ID || configJson.appId || '1:1084319951334:web:62920754c5da03e1868e27',
  apiKey: env.VITE_FIREBASE_API_KEY || configJson.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain || `${configJson.projectId || 'sylvan-classifier-gpqwl'}.firebaseapp.com`,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || configJson.firestoreDatabaseId || '(default)',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket || `${configJson.projectId || 'sylvan-classifier-gpqwl'}.appspot.com`,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId || '1084319951334',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || configJson.measurementId || '',
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore with the provisioned database ID
// CRITICAL: The app requires passing firestoreDatabaseId if configured.
// Use experimentalAutoDetectLongPolling to handle iframe/proxy environments seamlessly.
const targetDbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    targetDbId
  );
} catch {
  firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
}

export const db = firestoreInstance;

// Google Auth Provider for popup sign-in
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Validates connection to Firestore backend as per Firebase skill guidelines
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (
      error?.code === 'unavailable' ||
      (error instanceof Error &&
        (error.message.includes('the client is offline') || error.message.includes('unavailable')))
    ) {
      console.warn('Firestore is connecting or operating in offline cache mode.');
      return false;
    }
    // Permission denied or not found is normal for test doc when rules are in place
    return true;
  }
}

export default app;
