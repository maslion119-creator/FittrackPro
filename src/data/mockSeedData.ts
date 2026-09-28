import { FoodEntry, StepEntry, UserProfile, WaterEntry, WeightEntry, WorkoutEntry } from '../types/fitness';

export function getInitialSeedData() {
  const today = new Date();
  
  const formatDateOffset = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialProfile: UserProfile = {
    name: 'Alex Rivera',
    email: 'alex.fitness@example.com',
    age: 28,
    gender: 'male',
    height: 178, // cm
    weight: 76.5, // kg
    targetWeight: 72.0, // kg
    activityLevel: 'moderate',
    goal: 'lose_weight',
    dailyCalorieTarget: 2150,
    dailyStepGoal: 10000,
    dailyWaterGoal: 8, // glasses (2000 ml)
    weeklyWorkoutGoal: 4,
    unitPreference: {
      weight: 'kg',
      height: 'cm',
    },
    theme: 'light',
    isOnboarded: true,
  };

  // Steps for past 14 days (creating a solid 5-day active streak)
  const initialSteps: StepEntry[] = [
    { id: 's-0', date: formatDateOffset(0), steps: 10420, distanceKm: 7.9, caloriesBurned: 416 },
    { id: 's-1', date: formatDateOffset(1), steps: 11250, distanceKm: 8.5, caloriesBurned: 450 },
    { id: 's-2', date: formatDateOffset(2), steps: 10180, distanceKm: 7.7, caloriesBurned: 407 },
    { id: 's-3', date: formatDateOffset(3), steps: 12400, distanceKm: 9.4, caloriesBurned: 496 },
    { id: 's-4', date: formatDateOffset(4), steps: 10890, distanceKm: 8.2, caloriesBurned: 435 },
    { id: 's-5', date: formatDateOffset(5), steps: 7600,  distanceKm: 5.7, caloriesBurned: 304 },
    { id: 's-6', date: formatDateOffset(6), steps: 11050, distanceKm: 8.4, caloriesBurned: 442 },
    { id: 's-7', date: formatDateOffset(7), steps: 9800,  distanceKm: 7.4, caloriesBurned: 392 },
    { id: 's-8', date: formatDateOffset(8), steps: 10300, distanceKm: 7.8, caloriesBurned: 412 },
    { id: 's-9', date: formatDateOffset(9), steps: 13100, distanceKm: 9.9, caloriesBurned: 524 },
    { id: 's-10', date: formatDateOffset(10), steps: 8900, distanceKm: 6.7, caloriesBurned: 356 },
    { id: 's-11', date: formatDateOffset(11), steps: 10200, distanceKm: 7.7, caloriesBurned: 408 },
    { id: 's-12', date: formatDateOffset(12), steps: 11500, distanceKm: 8.7, caloriesBurned: 460 },
    { id: 's-13', date: formatDateOffset(13), steps: 10100, distanceKm: 7.6, caloriesBurned: 404 },
  ];

  // Water entries
  const initialWater: WaterEntry[] = [
    { date: formatDateOffset(0), glasses: 7 },
    { date: formatDateOffset(1), glasses: 8 },
    { date: formatDateOffset(2), glasses: 9 },
    { date: formatDateOffset(3), glasses: 8 },
    { date: formatDateOffset(4), glasses: 8 },
    { date: formatDateOffset(5), glasses: 6 },
    { date: formatDateOffset(6), glasses: 8 },
  ];

  // Weight history entries (showing steady healthy progress towards target)
  const initialWeights: WeightEntry[] = [
    { id: 'w-1', date: formatDateOffset(30), weight: 79.2, note: 'Starting baseline' },
    { id: 'w-2', date: formatDateOffset(23), weight: 78.6, note: 'End of week 1' },
    { id: 'w-3', date: formatDateOffset(16), weight: 77.9, note: 'Feeling leaner' },
    { id: 'w-4', date: formatDateOffset(9),  weight: 77.2, note: 'Mid-month check-in' },
    { id: 'w-5', date: formatDateOffset(3),  weight: 76.8, note: 'Post morning workout' },
    { id: 'w-6', date: formatDateOffset(0),  weight: 76.5, note: 'Weekly milestone' },
  ];

  // Food entries for today and yesterday
  const initialFoods: FoodEntry[] = [
    // Today
    { id: 'f-1', date: formatDateOffset(0), mealType: 'breakfast', foodName: 'Rolled Oats with Berries', calories: 340, protein: 14, carbs: 58, fats: 6, quantity: 60, servingUnit: 'g' },
    { id: 'f-2', date: formatDateOffset(0), mealType: 'breakfast', foodName: 'Greek Yogurt (Plain, Non-fat)', calories: 100, protein: 17, carbs: 6, fats: 1, quantity: 170, servingUnit: 'g' },
    { id: 'f-3', date: formatDateOffset(0), mealType: 'lunch', foodName: 'Chicken Breast (Cooked, Skinless)', calories: 248, protein: 46, carbs: 0, fats: 5, quantity: 150, servingUnit: 'g' },
    { id: 'f-4', date: formatDateOffset(0), mealType: 'lunch', foodName: 'Brown Rice (Cooked)', calories: 185, protein: 4, carbs: 38, fats: 2, quantity: 150, servingUnit: 'g' },
    { id: 'f-5', date: formatDateOffset(0), mealType: 'lunch', foodName: 'Broccoli (Steamed)', calories: 52, protein: 4, carbs: 10, fats: 1, quantity: 150, servingUnit: 'g' },
    { id: 'f-6', date: formatDateOffset(0), mealType: 'snack', foodName: 'Raw Almonds', calories: 162, protein: 6, carbs: 6, fats: 14, quantity: 28, servingUnit: 'g' },
    { id: 'f-7', date: formatDateOffset(0), mealType: 'snack', foodName: 'Whey Protein Powder', calories: 120, protein: 24, carbs: 2, fats: 1, quantity: 30, servingUnit: 'g' },
    { id: 'f-8', date: formatDateOffset(0), mealType: 'dinner', foodName: 'Atlantic Salmon (Baked)', calories: 309, protein: 33, carbs: 0, fats: 18, quantity: 150, servingUnit: 'g' },
    { id: 'f-9', date: formatDateOffset(0), mealType: 'dinner', foodName: 'Sweet Potato (Baked)', calories: 135, protein: 3, carbs: 31, fats: 0, quantity: 150, servingUnit: 'g' },
    
    // Yesterday
    { id: 'f-10', date: formatDateOffset(1), mealType: 'breakfast', foodName: 'Whole Large Eggs (2) & Toast', calories: 410, protein: 26, carbs: 32, fats: 20, quantity: 1, servingUnit: 'serving' },
    { id: 'f-11', date: formatDateOffset(1), mealType: 'lunch', foodName: 'Lean Ground Beef & Rice Bowl', calories: 620, protein: 44, carbs: 65, fats: 18, quantity: 1, servingUnit: 'bowl' },
    { id: 'f-12', date: formatDateOffset(1), mealType: 'dinner', foodName: 'Grilled Chicken & Quinoa Salad', calories: 540, protein: 48, carbs: 46, fats: 14, quantity: 1, servingUnit: 'serving' },
    { id: 'f-13', date: formatDateOffset(1), mealType: 'snack', foodName: 'Apple & Peanut Butter', calories: 245, protein: 5, carbs: 28, fats: 12, quantity: 1, servingUnit: 'snack' },
  ];

  // Workouts for this week
  const initialWorkouts: WorkoutEntry[] = [
    {
      id: 'wo-1',
      date: formatDateOffset(0),
      time: '07:30',
      category: 'Strength',
      exerciseName: 'Barbell Bench Press',
      sets: 4,
      reps: 8,
      weight: 75,
      duration: 35,
      caloriesBurned: 220,
      notes: 'Hit a smooth PR on 4th set!',
    },
    {
      id: 'wo-2',
      date: formatDateOffset(0),
      time: '08:10',
      category: 'Strength',
      exerciseName: 'Dumbbell Incline Press',
      sets: 3,
      reps: 10,
      weight: 26,
      duration: 20,
      caloriesBurned: 130,
    },
    {
      id: 'wo-3',
      date: formatDateOffset(2),
      time: '18:00',
      category: 'Cardio',
      exerciseName: 'Outdoor Running / Jogging',
      sets: 1,
      reps: 1,
      weight: 0,
      duration: 35,
      caloriesBurned: 385,
      notes: 'Paced at 5:12/km around city park loop',
    },
    {
      id: 'wo-4',
      date: formatDateOffset(3),
      time: '07:15',
      category: 'Strength',
      exerciseName: 'Barbell Back Squat',
      sets: 4,
      reps: 8,
      weight: 95,
      duration: 40,
      caloriesBurned: 290,
      notes: 'Deep depth, felt explosive',
    },
    {
      id: 'wo-5',
      date: formatDateOffset(4),
      time: '19:00',
      category: 'HIIT',
      exerciseName: 'Full Body HIIT Tabata',
      sets: 8,
      reps: 20,
      weight: 0,
      duration: 25,
      caloriesBurned: 310,
      notes: 'High heart rate interval training',
    },
  ];

  return {
    initialProfile,
    initialSteps,
    initialWater,
    initialWeights,
    initialFoods,
    initialWorkouts,
  };
}
