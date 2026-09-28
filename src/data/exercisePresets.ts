import { WorkoutCategory } from '../types/fitness';

export interface ExercisePreset {
  name: string;
  category: WorkoutCategory;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  defaultDurationMins: number;
  caloriesPerMinute: number;
}

export const EXERCISE_PRESETS: ExercisePreset[] = [
  // Strength
  { name: 'Barbell Bench Press', category: 'Strength', defaultSets: 4, defaultReps: 8, defaultWeightKg: 60, defaultDurationMins: 25, caloriesPerMinute: 6.5 },
  { name: 'Barbell Back Squat', category: 'Strength', defaultSets: 4, defaultReps: 8, defaultWeightKg: 80, defaultDurationMins: 30, caloriesPerMinute: 7.5 },
  { name: 'Conventional Deadlift', category: 'Strength', defaultSets: 3, defaultReps: 6, defaultWeightKg: 100, defaultDurationMins: 25, caloriesPerMinute: 8.0 },
  { name: 'Overhead Shoulder Press', category: 'Strength', defaultSets: 3, defaultReps: 10, defaultWeightKg: 40, defaultDurationMins: 20, caloriesPerMinute: 6.0 },
  { name: 'Pull-Ups / Chin-Ups', category: 'Strength', defaultSets: 3, defaultReps: 8, defaultWeightKg: 0, defaultDurationMins: 15, caloriesPerMinute: 6.5 },
  { name: 'Dumbbell Bicep Curls', category: 'Strength', defaultSets: 3, defaultReps: 12, defaultWeightKg: 14, defaultDurationMins: 15, caloriesPerMinute: 5.0 },
  { name: 'Tricep Cable Pushdowns', category: 'Strength', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25, defaultDurationMins: 15, caloriesPerMinute: 5.0 },
  { name: 'Leg Press', category: 'Strength', defaultSets: 3, defaultReps: 12, defaultWeightKg: 140, defaultDurationMins: 20, caloriesPerMinute: 6.5 },

  // Cardio
  { name: 'Outdoor Running / Jogging', category: 'Cardio', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 30, caloriesPerMinute: 11.0 },
  { name: 'Treadmill Incline Walk', category: 'Cardio', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 40, caloriesPerMinute: 7.0 },
  { name: 'Stationary Cycling', category: 'Cardio', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 35, caloriesPerMinute: 9.0 },
  { name: 'Jump Rope Circuit', category: 'Cardio', defaultSets: 5, defaultReps: 100, defaultWeightKg: 0, defaultDurationMins: 20, caloriesPerMinute: 12.0 },
  { name: 'Rowing Machine', category: 'Cardio', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 25, caloriesPerMinute: 10.0 },
  { name: 'Lap Swimming', category: 'Cardio', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 30, caloriesPerMinute: 9.5 },

  // HIIT
  { name: 'Full Body HIIT Tabata', category: 'HIIT', defaultSets: 8, defaultReps: 20, defaultWeightKg: 0, defaultDurationMins: 20, caloriesPerMinute: 12.5 },
  { name: 'Kettlebell Swings & Burpees', category: 'HIIT', defaultSets: 5, defaultReps: 15, defaultWeightKg: 16, defaultDurationMins: 25, caloriesPerMinute: 12.0 },
  { name: 'Battle Ropes & Box Jumps', category: 'HIIT', defaultSets: 4, defaultReps: 15, defaultWeightKg: 0, defaultDurationMins: 20, caloriesPerMinute: 11.5 },
  { name: 'Bodyweight Circuit (Pushups, Squats, Planks)', category: 'HIIT', defaultSets: 4, defaultReps: 20, defaultWeightKg: 0, defaultDurationMins: 25, caloriesPerMinute: 10.0 },

  // Yoga
  { name: 'Vinyasa Flow Yoga', category: 'Yoga', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 45, caloriesPerMinute: 4.5 },
  { name: 'Power Yoga & Core', category: 'Yoga', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 35, caloriesPerMinute: 5.5 },
  { name: 'Restorative / Yin Yoga', category: 'Yoga', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 30, caloriesPerMinute: 2.8 },

  // Pilates
  { name: 'Mat Pilates Core Sculpt', category: 'Pilates', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 30, caloriesPerMinute: 5.0 },
  { name: 'Reformer Pilates Class', category: 'Pilates', defaultSets: 1, defaultReps: 1, defaultWeightKg: 0, defaultDurationMins: 45, caloriesPerMinute: 6.0 },
];
