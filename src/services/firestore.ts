import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import {
  FoodEntry,
  StepEntry,
  UserProfile,
  WaterEntry,
  WeightEntry,
  WorkoutEntry,
} from '../types/fitness';
import { getInitialSeedData } from '../data/mockSeedData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler adhering to Firebase skill specifications
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// USER PROFILE OPERATIONS
// ----------------------------------------------------

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docPath = `users/${userId}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function setUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    const cleanData = {
      ...data,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId), cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export function listenToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docPath = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    snapshot => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    error => {
      console.warn('Profile snapshot error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

// ----------------------------------------------------
// STEP ENTRIES OPERATIONS
// ----------------------------------------------------

export async function addStepEntry(
  userId: string,
  entry: Omit<StepEntry, 'id'> & { id?: string }
): Promise<string> {
  const collectionPath = `users/${userId}/stepEntries`;
  try {
    const entryId = entry.id || `step-${entry.date}`;
    const docRef = doc(db, 'users', userId, 'stepEntries', entryId);
    await setDoc(docRef, {
      ...entry,
      id: entryId,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export async function deleteStepEntry(userId: string, entryId: string): Promise<void> {
  const docPath = `users/${userId}/stepEntries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'stepEntries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function listenToStepEntries(
  userId: string,
  callback: (entries: StepEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/stepEntries`;
  const q = query(collection(db, 'users', userId, 'stepEntries'));
  return onSnapshot(
    q,
    snapshot => {
      const items: StepEntry[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as StepEntry);
      });
      // Sort descending by date
      items.sort((a, b) => b.date.localeCompare(a.date));
      callback(items);
    },
    error => {
      console.warn('Step entries listener error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// ----------------------------------------------------
// FOOD ENTRIES OPERATIONS
// ----------------------------------------------------

export async function addFoodEntry(
  userId: string,
  entry: Omit<FoodEntry, 'id'> & { id?: string }
): Promise<string> {
  const collectionPath = `users/${userId}/foodEntries`;
  try {
    const entryId = entry.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'users', userId, 'foodEntries', entryId);
    await setDoc(docRef, {
      ...entry,
      id: entryId,
      createdAt: new Date().toISOString(),
    });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function updateFoodEntry(userId: string, entry: FoodEntry): Promise<void> {
  const docPath = `users/${userId}/foodEntries/${entry.id}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'foodEntries', entry.id), {
      ...entry,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteFoodEntry(userId: string, entryId: string): Promise<void> {
  const docPath = `users/${userId}/foodEntries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'foodEntries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function listenToFoodEntries(
  userId: string,
  callback: (entries: FoodEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/foodEntries`;
  const q = query(collection(db, 'users', userId, 'foodEntries'));
  return onSnapshot(
    q,
    snapshot => {
      const items: FoodEntry[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as FoodEntry);
      });
      // Sort descending by date
      items.sort((a, b) => b.date.localeCompare(a.date));
      callback(items);
    },
    error => {
      console.warn('Food entries listener error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// ----------------------------------------------------
// WORKOUT ENTRIES OPERATIONS
// ----------------------------------------------------

export async function addWorkoutEntry(
  userId: string,
  entry: Omit<WorkoutEntry, 'id'> & { id?: string }
): Promise<string> {
  const collectionPath = `users/${userId}/workoutEntries`;
  try {
    const entryId = entry.id || `workout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'users', userId, 'workoutEntries', entryId);
    await setDoc(docRef, {
      ...entry,
      id: entryId,
      createdAt: new Date().toISOString(),
    });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function deleteWorkoutEntry(userId: string, entryId: string): Promise<void> {
  const docPath = `users/${userId}/workoutEntries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutEntries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function listenToWorkoutEntries(
  userId: string,
  callback: (entries: WorkoutEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/workoutEntries`;
  const q = query(collection(db, 'users', userId, 'workoutEntries'));
  return onSnapshot(
    q,
    snapshot => {
      const items: WorkoutEntry[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as WorkoutEntry);
      });
      // Sort descending by date
      items.sort((a, b) => b.date.localeCompare(a.date));
      callback(items);
    },
    error => {
      console.warn('Workout entries listener error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// ----------------------------------------------------
// WEIGHT ENTRIES OPERATIONS
// ----------------------------------------------------

export async function addWeightEntry(
  userId: string,
  entry: Omit<WeightEntry, 'id'> & { id?: string }
): Promise<string> {
  const collectionPath = `users/${userId}/weightEntries`;
  try {
    const entryId = entry.id || `weight-${entry.date}`;
    const docRef = doc(db, 'users', userId, 'weightEntries', entryId);
    await setDoc(docRef, {
      ...entry,
      id: entryId,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export async function deleteWeightEntry(userId: string, entryId: string): Promise<void> {
  const docPath = `users/${userId}/weightEntries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'weightEntries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function listenToWeightEntries(
  userId: string,
  callback: (entries: WeightEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/weightEntries`;
  const q = query(collection(db, 'users', userId, 'weightEntries'));
  return onSnapshot(
    q,
    snapshot => {
      const items: WeightEntry[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as WeightEntry);
      });
      // Sort ascending by date for chronological tracking
      items.sort((a, b) => a.date.localeCompare(b.date));
      callback(items);
    },
    error => {
      console.warn('Weight entries listener error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// ----------------------------------------------------
// WATER ENTRIES OPERATIONS
// ----------------------------------------------------

export async function setWaterEntry(
  userId: string,
  date: string,
  glasses: number
): Promise<void> {
  const docPath = `users/${userId}/waterEntries/${date}`;
  try {
    const docRef = doc(db, 'users', userId, 'waterEntries', date);
    await setDoc(docRef, {
      date,
      glasses,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export function listenToWaterEntries(
  userId: string,
  callback: (entries: WaterEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/waterEntries`;
  const q = query(collection(db, 'users', userId, 'waterEntries'));
  return onSnapshot(
    q,
    snapshot => {
      const items: WaterEntry[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as WaterEntry);
      });
      callback(items);
    },
    error => {
      console.warn('Water entries listener error', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// ----------------------------------------------------
// SEED & DEMO RESTORE IN FIRESTORE
// ----------------------------------------------------

export async function seedInitialUserFirestoreData(
  userId: string,
  baseProfile: UserProfile
): Promise<void> {
  const seed = getInitialSeedData();
  
  // 1. Profile
  await setUserProfile(userId, {
    ...baseProfile,
    isOnboarded: true,
  });

  // 2. Steps
  for (const s of seed.initialSteps) {
    await addStepEntry(userId, s);
  }

  // 3. Foods
  for (const f of seed.initialFoods) {
    await addFoodEntry(userId, f);
  }

  // 4. Workouts
  for (const w of seed.initialWorkouts) {
    await addWorkoutEntry(userId, w);
  }

  // 5. Weights
  for (const w of seed.initialWeights) {
    await addWeightEntry(userId, w);
  }

  // 6. Water
  for (const wt of seed.initialWater) {
    await setWaterEntry(userId, wt.date, wt.glasses);
  }
}

export async function clearUserFirestoreData(userId: string): Promise<void> {
  const collections = ['stepEntries', 'foodEntries', 'workoutEntries', 'weightEntries', 'waterEntries'];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, 'users', userId, colName));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
}
