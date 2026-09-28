import { ActivityLevel, FitnessGoal, Gender, StepEntry } from '../types/fitness';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(years) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1800;
  
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

/**
 * Activity level multiplier for Total Daily Energy Expenditure (TDEE)
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates suggested daily calorie intake based on fitness goal
 */
export function calculateCalorieTarget(
  tdee: number,
  goal: FitnessGoal
): number {
  let target = tdee;
  if (goal === 'lose_weight') {
    target = tdee - 500; // Moderate 500 kcal deficit (~0.5kg/week fat loss)
  } else if (goal === 'build_muscle') {
    target = tdee + 350; // Lean surplus (~300-400 kcal)
  }
  // Enforce a healthy floor
  return Math.max(1200, Math.round(target));
}

/**
 * Calculates recommended macronutrient distribution (grams)
 */
export function calculateSuggestedMacros(
  calorieTarget: number,
  weightKg: number,
  goal: FitnessGoal
) {
  // Protein: roughly 1.8g - 2.2g per kg bodyweight
  let proteinGrams = Math.round(weightKg * (goal === 'build_muscle' ? 2.2 : 2.0));
  // Limit protein to maximum 35% of calories
  if (proteinGrams * 4 > calorieTarget * 0.35) {
    proteinGrams = Math.round((calorieTarget * 0.30) / 4);
  }
  
  // Fats: ~25% of calories (1g fat = 9 kcal)
  const fatCalories = calorieTarget * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories go to carbs (1g carb = 4 kcal)
  const remainingCalories = Math.max(0, calorieTarget - (proteinGrams * 4) - (fatGrams * 9));
  const carbGrams = Math.round(remainingCalories / 4);

  return {
    protein: proteinGrams,
    fats: fatGrams,
    carbs: carbGrams,
  };
}

/**
 * Calculates Body Mass Index (BMI) = weight(kg) / height(m)^2
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
  description: string;
} {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: 'Normal', color: 'text-slate-400', description: 'Enter valid height and weight' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      color: 'text-amber-400',
      description: 'Below healthy weight range (< 18.5)',
    };
  } else if (bmi < 25) {
    return {
      bmi,
      category: 'Normal',
      color: 'text-emerald-400',
      description: 'Healthy optimal weight range (18.5 – 24.9)',
    };
  } else if (bmi < 30) {
    return {
      bmi,
      category: 'Overweight',
      color: 'text-amber-400',
      description: 'Moderate excess body mass (25.0 – 29.9)',
    };
  } else {
    return {
      bmi,
      category: 'Obese',
      color: 'text-rose-400',
      description: 'Significantly elevated body mass (≥ 30.0)',
    };
  }
}

/**
 * Calculates consecutive active day streak for meeting step goal
 */
export function calculateStepStreak(stepEntries: StepEntry[], dailyGoal: number): number {
  if (!stepEntries.length || dailyGoal <= 0) return 0;

  // Map dates to steps
  const stepMap = new Map<string, number>();
  for (const entry of stepEntries) {
    stepMap.set(entry.date, (stepMap.get(entry.date) || 0) + entry.steps);
  }

  let streak = 0;
  const cursor = new Date();
  
  // Format YYYY-MM-DD in local time
  const formatLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocal(cursor);
  const todaySteps = stepMap.get(todayStr) || 0;

  // If today hasn't met the goal yet, we check if yesterday did to keep streak alive
  if (todaySteps >= dailyGoal) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // Check yesterday
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayStr = formatLocal(cursor);
    if ((stepMap.get(yesterdayStr) || 0) < dailyGoal) {
      return 0; // Streak broken
    }
  }

  // Count backwards
  while (true) {
    const dateStr = formatLocal(cursor);
    const steps = stepMap.get(dateStr) || 0;
    if (steps >= dailyGoal) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Estimated calories burned for workout categories
 */
export function estimateWorkoutCalories(
  category: string,
  durationMins: number,
  weightKg: number = 70
): number {
  if (durationMins <= 0) return 0;
  // MET values (Metabolic Equivalent of Task)
  // Calories = MET * weight(kg) * (duration / 60)
  const METs: Record<string, number> = {
    Cardio: 8.5,
    HIIT: 9.5,
    Strength: 5.5,
    Yoga: 3.5,
    Pilates: 4.5,
    Other: 6.0,
  };
  const met = METs[category] || 6.0;
  return Math.round(met * weightKg * (durationMins / 60));
}

/**
 * Conversion helpers
 */
export function kgToLbs(kg: number): number {
  return Number((kg * 2.20462).toFixed(1));
}

export function lbsToKg(lbs: number): number {
  return Number((lbs / 2.20462).toFixed(1));
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * Today's date string YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
