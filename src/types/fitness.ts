export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type FitnessGoal = 'lose_weight' | 'maintain' | 'build_muscle';

export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft_in';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number; // stored in cm
  weight: number; // stored in kg
  targetWeight: number; // stored in kg
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dailyCalorieTarget: number;
  dailyStepGoal: number;
  dailyWaterGoal: number; // in glasses (1 glass = 250ml)
  weeklyWorkoutGoal: number; // workouts per week
  unitPreference: {
    weight: WeightUnit;
    height: HeightUnit;
  };
  theme: 'dark' | 'light';
  isOnboarded: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StepEntry {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm?: number;
  caloriesBurned?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fats: number;    // grams
  quantity: number; // in grams or servings
  servingUnit?: string;
}

export interface FoodItemTemplate {
  id: string;
  name: string;
  category: 'Protein' | 'Carbs & Grains' | 'Fruits' | 'Vegetables' | 'Dairy & Alternatives' | 'Snacks & Fats' | 'Beverages';
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  defaultServingGrams: number;
  servingLabel: string;
}

export type WorkoutCategory = 'Strength' | 'Cardio' | 'HIIT' | 'Yoga' | 'Pilates' | 'Other';

export interface WorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: WorkoutCategory;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number; // in kg (0 for bodyweight/cardio)
  duration: number; // in minutes
  caloriesBurned: number;
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // stored in kg
  note?: string;
}

export interface WaterEntry {
  date: string; // YYYY-MM-DD
  glasses: number; // count of glasses (250ml each)
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'celebration';
}

export type ActiveTab = 'dashboard' | 'steps' | 'diet' | 'workouts' | 'progress' | 'settings';
