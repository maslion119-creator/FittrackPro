import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { getUserProfile, setUserProfile } from './firestore';
import { UserProfile } from '../types/fitness';
import { calculateBMR, calculateCalorieTarget, calculateTDEE } from '../utils/fitnessCalculations';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'lose_weight' | 'maintain' | 'build_muscle';
}

/**
 * Maps Firebase Auth error codes to user-friendly human readable explanations
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please log in instead or use another email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address format (e.g. name@example.com).';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 8 characters with letters and numbers.';
    case 'auth/user-not-found':
      return 'No account exists with this email address. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed login attempts. Please reset your password or try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/popup-blocked':
      return 'Pop-up window was blocked by your browser. Please allow popups for this site.';
    default:
      return error.message || 'Authentication error. Please try again.';
  }
}

/**
 * Creates a new user in Firebase Auth and establishes their Firestore document in `users/{userId}`
 */
export async function signUpWithEmail(data: SignUpData): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const user = userCredential.user;

  // Update Auth displayName
  if (data.name) {
    try {
      await updateFirebaseProfile(user, { displayName: data.name });
    } catch (e) {
      console.warn('Failed to update displayName on auth user', e);
    }
  }

  // Calculate sensible initial metabolic targets
  const age = data.age || 26;
  const gender = data.gender || 'male';
  const height = data.height || 175;
  const weight = data.weight || 75;
  const targetWeight = data.targetWeight || 70;
  const activityLevel = data.activityLevel || 'moderate';
  const goal = data.goal || 'lose_weight';

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);

  const initialProfile: UserProfile = {
    uid: user.uid,
    name: data.name || user.email?.split('@')[0] || 'Fitness Pioneer',
    email: data.email,
    age,
    gender,
    height,
    weight,
    targetWeight,
    activityLevel,
    goal,
    dailyCalorieTarget: calorieTarget,
    dailyStepGoal: 10000,
    dailyWaterGoal: 8,
    weeklyWorkoutGoal: 4,
    unitPreference: {
      weight: 'kg',
      height: 'cm',
    },
    theme: 'dark',
    isOnboarded: false, // will prompt for onboarding if fields were not fully provided
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create initial user document in Firestore `users/{userId}`
  await setUserProfile(user.uid, initialProfile);

  return user;
}

/**
 * Signs in an existing user with email and password
 */
export async function logInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Signs in or signs up with Google Provider Popup
 */
export async function logInWithGoogle(): Promise<FirebaseUser> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user document already exists in Firestore
  const existingProfile = await getUserProfile(user.uid);
  if (!existingProfile) {
    // Initialize profile document for newly registered Google user
    const defaultProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Fit Pioneer',
      email: user.email || '',
      age: 26,
      gender: 'male',
      height: 175,
      weight: 75,
      targetWeight: 70,
      activityLevel: 'moderate',
      goal: 'lose_weight',
      dailyCalorieTarget: 2150,
      dailyStepGoal: 10000,
      dailyWaterGoal: 8,
      weeklyWorkoutGoal: 4,
      unitPreference: {
        weight: 'kg',
        height: 'cm',
      },
      theme: 'dark',
      isOnboarded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setUserProfile(user.uid, defaultProfile);
  }

  return user;
}

/**
 * Sends a password reset email via Firebase Auth
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Signs out the current user session
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to auth state changes across page refreshes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
