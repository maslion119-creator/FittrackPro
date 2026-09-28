import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  FoodEntry,
  StepEntry,
  ToastMessage,
  UserProfile,
  WaterEntry,
  WeightEntry,
  WorkoutEntry,
} from '../types/fitness';
import {
  calculateBMI,
  calculateBMR,
  calculateCalorieTarget,
  calculateStepStreak,
  calculateSuggestedMacros,
  calculateTDEE,
  getTodayDateString,
} from '../utils/fitnessCalculations';
import { getInitialSeedData } from '../data/mockSeedData';
import { useAuth } from './AuthContext';
import {
  addFoodEntry as firestoreAddFood,
  addStepEntry as firestoreAddStep,
  addWeightEntry as firestoreAddWeight,
  addWorkoutEntry as firestoreAddWorkout,
  clearUserFirestoreData,
  deleteFoodEntry as firestoreDeleteFood,
  deleteStepEntry as firestoreDeleteStep,
  deleteWeightEntry as firestoreDeleteWeight,
  deleteWorkoutEntry as firestoreDeleteWorkout,
  listenToFoodEntries,
  listenToStepEntries,
  listenToWaterEntries,
  listenToWeightEntries,
  listenToWorkoutEntries,
  seedInitialUserFirestoreData,
  setWaterEntry as firestoreSetWater,
  updateFoodEntry as firestoreUpdateFood,
  updateUserProfile as firestoreUpdateProfile,
  setUserProfile as firestoreSetProfile,
} from '../services/firestore';

interface FitnessContextType {
  profile: UserProfile;
  stepEntries: StepEntry[];
  foodEntries: FoodEntry[];
  workoutEntries: WorkoutEntry[];
  weightEntries: WeightEntry[];
  waterEntries: WaterEntry[];
  selectedDate: string;
  activeTab: ActiveTab;
  toast: ToastMessage | null;
  isSyncing: boolean;

  // Setters & Nav
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'celebration') => void;
  hideToast: () => void;
  triggerConfetti: () => void;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (updates: Partial<UserProfile>) => Promise<void>;
  logSteps: (steps: number, date?: string) => Promise<void>;
  addStepsQuick: (delta: number, date?: string) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  updateFoodEntry: (entry: FoodEntry) => Promise<void>;
  addWorkout: (entry: Omit<WorkoutEntry, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  logWeight: (weight: number, date?: string, note?: string) => Promise<void>;
  deleteWeight: (id: string) => Promise<void>;
  logWater: (glasses: number, date?: string) => Promise<void>;
  incrementWater: (delta: number, date?: string) => Promise<void>;
  resetAllData: (withEmptyState?: boolean) => Promise<void>;
  loadSampleData: () => Promise<void>;
  toggleTheme: () => void;

  // Computed getters for selectedDate
  currentDaySteps: number;
  currentDayStepGoal: number;
  currentDayCalories: number;
  currentDayMacros: { protein: number; carbs: number; fats: number };
  currentDayWater: number;
  currentDayWorkouts: WorkoutEntry[];
  thisWeekWorkouts: WorkoutEntry[];
  currentStreak: number;
  bmiData: ReturnType<typeof calculateBMI>;
  suggestedMacros: ReturnType<typeof calculateSuggestedMacros>;
}

const STORAGE_KEYS = {
  PROFILE: 'fittrack_profile_v2',
  STEPS: 'fittrack_steps_v2',
  FOODS: 'fittrack_foods_v2',
  WORKOUTS: 'fittrack_workouts_v2',
  WEIGHTS: 'fittrack_weights_v2',
  WATER: 'fittrack_water_v2',
};

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const seed = useMemo(() => getInitialSeedData(), []);

  // Offline / Cache fallback state
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const userTheme = localStorage.getItem('fittrack_theme_mode');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          theme: userTheme ? (userTheme as 'light' | 'dark') : 'light',
        };
      }
      return { ...seed.initialProfile, theme: 'light' };
    } catch {
      return { ...seed.initialProfile, theme: 'light' };
    }
  });

  const [stepEntries, setStepEntries] = useState<StepEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STEPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOODS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync profile from AuthContext when user profile updates from Firestore
  useEffect(() => {
    if (userProfile) {
      setProfile(prev => ({
        ...prev,
        ...userProfile,
      }));
    }
  }, [userProfile]);

  // Firestore Real-Time Listeners: Attach when currentUser exists
  useEffect(() => {
    if (!currentUser) {
      // Clear data for security and clean screen if user logs out
      setStepEntries([]);
      setFoodEntries([]);
      setWorkoutEntries([]);
      setWeightEntries([]);
      setWaterEntries([]);
      return;
    }

    const userId = currentUser.uid;
    setIsSyncing(true);

    // 1. Steps listener
    const unsubSteps = listenToStepEntries(
      userId,
      entries => {
        setStepEntries(entries);
        localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(entries));
        setIsSyncing(false);
      },
      () => setIsSyncing(false)
    );

    // 2. Food listener
    const unsubFood = listenToFoodEntries(
      userId,
      entries => {
        setFoodEntries(entries);
        localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(entries));
      }
    );

    // 3. Workouts listener
    const unsubWorkouts = listenToWorkoutEntries(
      userId,
      entries => {
        setWorkoutEntries(entries);
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(entries));
      }
    );

    // 4. Weight listener
    const unsubWeights = listenToWeightEntries(
      userId,
      entries => {
        setWeightEntries(entries);
        localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(entries));
      }
    );

    // 5. Water listener
    const unsubWater = listenToWaterEntries(
      userId,
      entries => {
        setWaterEntries(entries);
        localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(entries));
      }
    );

    return () => {
      unsubSteps();
      unsubFood();
      unsubWorkouts();
      unsubWeights();
      unsubWater();
    };
  }, [currentUser]);

  // Sync profile changes to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Storage cache error', e);
    }
  }, [profile]);

  // Apply dark mode theme class to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [profile.theme]);

  // Toast Helper
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'celebration' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, title, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }
  }, []);

  // Profile update
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      const weight = next.weight;
      const height = next.height;
      const age = next.age;
      const gender = next.gender;
      const act = next.activityLevel;
      const goal = next.goal;

      if (!updates.dailyCalorieTarget && (updates.weight || updates.height || updates.age || updates.gender || updates.activityLevel || updates.goal)) {
        const bmr = calculateBMR(weight, height, age, gender);
        const tdee = calculateTDEE(bmr, act);
        next.dailyCalorieTarget = calculateCalorieTarget(tdee, goal);
      }
      return next;
    });

    if (currentUser) {
      try {
        await firestoreUpdateProfile(currentUser.uid, updates);
      } catch (e) {
        console.warn('Firestore update profile error', e);
      }
    }
  }, [currentUser]);

  const completeOnboarding = useCallback(async (updates: Partial<UserProfile>) => {
    const merged = { ...profile, ...updates, isOnboarded: true };
    const bmr = calculateBMR(merged.weight, merged.height, merged.age, merged.gender);
    const tdee = calculateTDEE(bmr, merged.activityLevel);
    merged.dailyCalorieTarget = calculateCalorieTarget(tdee, merged.goal);

    setProfile(merged);

    if (currentUser) {
      try {
        await firestoreSetProfile(currentUser.uid, merged);
      } catch (e) {
        console.warn('Firestore complete onboarding error', e);
      }
    }

    showToast('Welcome to FitTrack! 🚀', 'Your personalized fitness profile is set up and saved to Cloud Firestore.', 'celebration');
    triggerConfetti();
  }, [profile, currentUser, showToast, triggerConfetti]);

  // Steps
  const logSteps = useCallback(async (steps: number, targetDate?: string) => {
    const date = targetDate || selectedDate;
    const sanitizedSteps = Math.max(0, Math.floor(steps));
    const distanceKm = Number(((sanitizedSteps * 0.762) / 1000).toFixed(2));
    const caloriesBurned = Math.round(sanitizedSteps * 0.04);
    const stepId = `step-${date}`;

    // Optimistic UI update
    setStepEntries(prev => {
      const existingIndex = prev.findIndex(e => e.date === date);
      let updated: StepEntry[];
      const wasBelowGoal = existingIndex >= 0 ? prev[existingIndex].steps < profile.dailyStepGoal : true;

      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          steps: sanitizedSteps,
          distanceKm,
          caloriesBurned,
        };
      } else {
        const newEntry: StepEntry = {
          id: stepId,
          date,
          steps: sanitizedSteps,
          distanceKm,
          caloriesBurned,
        };
        updated = [newEntry, ...prev];
      }

      if (wasBelowGoal && sanitizedSteps >= profile.dailyStepGoal) {
        showToast('Daily Step Goal Met! 👟', `Incredible job! You reached ${sanitizedSteps.toLocaleString()} steps today.`, 'celebration');
        triggerConfetti();
      }

      return updated;
    });

    if (currentUser) {
      try {
        await firestoreAddStep(currentUser.uid, {
          id: stepId,
          date,
          steps: sanitizedSteps,
          distanceKm,
          caloriesBurned,
        });
      } catch (e) {
        console.warn('Firestore step log error', e);
      }
    }
  }, [selectedDate, profile.dailyStepGoal, currentUser, showToast, triggerConfetti]);

  const addStepsQuick = useCallback(async (delta: number, targetDate?: string) => {
    const date = targetDate || selectedDate;
    const currentEntry = stepEntries.find(e => e.date === date);
    const current = currentEntry ? currentEntry.steps : 0;
    await logSteps(current + delta, date);
  }, [stepEntries, selectedDate, logSteps]);

  // Food entries
  const addFoodEntry = useCallback(async (entry: Omit<FoodEntry, 'id'>) => {
    const tempId = `food-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: FoodEntry = { ...entry, id: tempId };

    // Optimistic
    setFoodEntries(prev => [newEntry, ...prev]);
    showToast('Meal Logged 🥗', `Added ${newEntry.foodName} (${newEntry.calories} kcal).`);

    if (currentUser) {
      try {
        await firestoreAddFood(currentUser.uid, newEntry);
      } catch (e) {
        console.warn('Firestore add food error', e);
      }
    }
  }, [currentUser, showToast]);

  const deleteFoodEntry = useCallback(async (id: string) => {
    setFoodEntries(prev => prev.filter(e => e.id !== id));
    showToast('Removed', 'Food entry removed.');

    if (currentUser) {
      try {
        await firestoreDeleteFood(currentUser.uid, id);
      } catch (e) {
        console.warn('Firestore delete food error', e);
      }
    }
  }, [currentUser, showToast]);

  const updateFoodEntry = useCallback(async (entry: FoodEntry) => {
    setFoodEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    showToast('Updated', 'Food entry updated.');

    if (currentUser) {
      try {
        await firestoreUpdateFood(currentUser.uid, entry);
      } catch (e) {
        console.warn('Firestore update food error', e);
      }
    }
  }, [currentUser, showToast]);

  // Workout entries
  const addWorkout = useCallback(async (entry: Omit<WorkoutEntry, 'id'>) => {
    const tempId = `workout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: WorkoutEntry = { ...entry, id: tempId };

    setWorkoutEntries(prev => [newEntry, ...prev]);
    showToast('Workout Logged! 💪', `${entry.exerciseName} logged (${entry.caloriesBurned} kcal burned).`, 'celebration');

    if (currentUser) {
      try {
        await firestoreAddWorkout(currentUser.uid, newEntry);
      } catch (e) {
        console.warn('Firestore add workout error', e);
      }
    }
  }, [currentUser, showToast]);

  const deleteWorkout = useCallback(async (id: string) => {
    setWorkoutEntries(prev => prev.filter(e => e.id !== id));
    showToast('Workout Removed', 'Workout deleted from log.');

    if (currentUser) {
      try {
        await firestoreDeleteWorkout(currentUser.uid, id);
      } catch (e) {
        console.warn('Firestore delete workout error', e);
      }
    }
  }, [currentUser, showToast]);

  // Weight entries
  const logWeight = useCallback(async (weight: number, targetDate?: string, note?: string) => {
    const date = targetDate || selectedDate;
    const sanitized = Math.max(20, Math.min(350, Number(weight.toFixed(1))));
    const weightId = `w-${date}`;

    setWeightEntries(prev => {
      const existingIdx = prev.findIndex(w => w.date === date);
      let updated: WeightEntry[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], weight: sanitized, note };
      } else {
        const newWeight: WeightEntry = {
          id: weightId,
          date,
          weight: sanitized,
          note,
        };
        updated = [...prev, newWeight].sort((a, b) => a.date.localeCompare(b.date));
      }
      return updated;
    });

    if (date === getTodayDateString()) {
      updateProfile({ weight: sanitized });
    }

    showToast('Weight Recorded ⚖️', `Logged ${sanitized} kg.`);

    if (currentUser) {
      try {
        await firestoreAddWeight(currentUser.uid, {
          id: weightId,
          date,
          weight: sanitized,
          note,
        });
      } catch (e) {
        console.warn('Firestore add weight error', e);
      }
    }
  }, [selectedDate, updateProfile, currentUser, showToast]);

  const deleteWeight = useCallback(async (id: string) => {
    setWeightEntries(prev => prev.filter(e => e.id !== id));
    showToast('Removed', 'Weight record removed.');

    if (currentUser) {
      try {
        await firestoreDeleteWeight(currentUser.uid, id);
      } catch (e) {
        console.warn('Firestore delete weight error', e);
      }
    }
  }, [currentUser, showToast]);

  // Water entries
  const logWater = useCallback(async (glasses: number, targetDate?: string) => {
    const date = targetDate || selectedDate;
    const sanitized = Math.max(0, Math.min(30, glasses));

    setWaterEntries(prev => {
      const existing = prev.find(w => w.date === date);
      const wasBelow = existing ? existing.glasses < profile.dailyWaterGoal : true;
      let updated: WaterEntry[];

      if (existing) {
        updated = prev.map(w => w.date === date ? { ...w, glasses: sanitized } : w);
      } else {
        updated = [...prev, { date, glasses: sanitized }];
      }

      if (wasBelow && sanitized >= profile.dailyWaterGoal) {
        showToast('Hydration Goal Met! 💧', `Great job drinking ${sanitized} glasses of water today!`, 'celebration');
        triggerConfetti();
      }

      return updated;
    });

    if (currentUser) {
      try {
        await firestoreSetWater(currentUser.uid, date, sanitized);
      } catch (e) {
        console.warn('Firestore water set error', e);
      }
    }
  }, [selectedDate, profile.dailyWaterGoal, currentUser, showToast, triggerConfetti]);

  const incrementWater = useCallback(async (delta: number, targetDate?: string) => {
    const date = targetDate || selectedDate;
    const current = waterEntries.find(w => w.date === date)?.glasses || 0;
    await logWater(Math.max(0, current + delta), date);
  }, [waterEntries, selectedDate, logWater]);

  // Reset or reseed in Firestore
  const resetAllData = useCallback(async (withEmptyState: boolean = false) => {
    if (currentUser) {
      try {
        await clearUserFirestoreData(currentUser.uid);
      } catch (e) {
        console.warn('Firestore clear data error', e);
      }
    }

    if (withEmptyState) {
      setStepEntries([]);
      setFoodEntries([]);
      setWorkoutEntries([]);
      setWeightEntries([]);
      setWaterEntries([]);
      setProfile(prev => ({
        ...prev,
        isOnboarded: false,
      }));
    } else {
      const freshSeed = getInitialSeedData();
      setProfile(freshSeed.initialProfile);
      setStepEntries(freshSeed.initialSteps);
      setFoodEntries(freshSeed.initialFoods);
      setWorkoutEntries(freshSeed.initialWorkouts);
      setWeightEntries(freshSeed.initialWeights);
      setWaterEntries(freshSeed.initialWater);
    }
    showToast('Data Reset', withEmptyState ? 'All tracking data has been cleared from Firestore.' : 'Restored sample baseline data.');
  }, [currentUser, showToast]);

  const loadSampleData = useCallback(async () => {
    const freshSeed = getInitialSeedData();
    setProfile(freshSeed.initialProfile);
    setStepEntries(freshSeed.initialSteps);
    setFoodEntries(freshSeed.initialFoods);
    setWorkoutEntries(freshSeed.initialWorkouts);
    setWeightEntries(freshSeed.initialWeights);
    setWaterEntries(freshSeed.initialWater);

    if (currentUser) {
      try {
        await seedInitialUserFirestoreData(currentUser.uid, freshSeed.initialProfile);
      } catch (e) {
        console.warn('Firestore seed sample error', e);
      }
    }

    showToast('Sample Data Loaded ✨', 'Demo history synchronized to your Cloud Firestore account.');
  }, [currentUser, showToast]);

  const toggleTheme = useCallback(() => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('fittrack_theme_mode', nextTheme);
    } catch {
      // ignore
    }
    setProfile(prev => ({
      ...prev,
      theme: nextTheme,
    }));
    if (currentUser) {
      firestoreUpdateProfile(currentUser.uid, { theme: nextTheme }).catch(() => {});
    }
  }, [profile.theme, currentUser]);

  // Computed values
  const currentDaySteps = useMemo(() => {
    return stepEntries.find(s => s.date === selectedDate)?.steps || 0;
  }, [stepEntries, selectedDate]);

  const currentDayCalories = useMemo(() => {
    return foodEntries
      .filter(f => f.date === selectedDate)
      .reduce((sum, item) => sum + item.calories, 0);
  }, [foodEntries, selectedDate]);

  const currentDayMacros = useMemo(() => {
    return foodEntries
      .filter(f => f.date === selectedDate)
      .reduce(
        (acc, item) => ({
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fats: acc.fats + item.fats,
        }),
        { protein: 0, carbs: 0, fats: 0 }
      );
  }, [foodEntries, selectedDate]);

  const currentDayWater = useMemo(() => {
    return waterEntries.find(w => w.date === selectedDate)?.glasses || 0;
  }, [waterEntries, selectedDate]);

  const currentDayWorkouts = useMemo(() => {
    return workoutEntries.filter(w => w.date === selectedDate);
  }, [workoutEntries, selectedDate]);

  const thisWeekWorkouts = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    return workoutEntries.filter(w => w.date >= weekAgoStr);
  }, [workoutEntries]);

  const currentStreak = useMemo(() => {
    return calculateStepStreak(stepEntries, profile.dailyStepGoal);
  }, [stepEntries, profile.dailyStepGoal]);

  const bmiData = useMemo(() => {
    return calculateBMI(profile.weight, profile.height);
  }, [profile.weight, profile.height]);

  const suggestedMacros = useMemo(() => {
    return calculateSuggestedMacros(profile.dailyCalorieTarget, profile.weight, profile.goal);
  }, [profile.dailyCalorieTarget, profile.weight, profile.goal]);

  return (
    <FitnessContext.Provider
      value={{
        profile,
        stepEntries,
        foodEntries,
        workoutEntries,
        weightEntries,
        waterEntries,
        selectedDate,
        activeTab,
        toast,
        isSyncing,
        setSelectedDate,
        setActiveTab,
        showToast,
        hideToast,
        triggerConfetti,
        updateProfile,
        completeOnboarding,
        logSteps,
        addStepsQuick,
        addFoodEntry,
        deleteFoodEntry,
        updateFoodEntry,
        addWorkout,
        deleteWorkout,
        logWeight,
        deleteWeight,
        logWater,
        incrementWater,
        resetAllData,
        loadSampleData,
        toggleTheme,
        currentDaySteps,
        currentDayStepGoal: profile.dailyStepGoal,
        currentDayCalories,
        currentDayMacros,
        currentDayWater,
        currentDayWorkouts,
        thisWeekWorkouts,
        currentStreak,
        bmiData,
        suggestedMacros,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}
