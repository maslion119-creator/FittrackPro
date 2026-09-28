import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { StatRing } from '../common/StatRing';
import {
  Footprints,
  Flame,
  Droplets,
  Dumbbell,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Award,
  Sparkles,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { formatDateLabel, kgToLbs } from '../../utils/fitnessCalculations';

export const Dashboard: React.FC = () => {
  const {
    profile,
    selectedDate,
    currentDaySteps,
    currentDayCalories,
    currentDayMacros,
    currentDayWater,
    currentDayWorkouts,
    thisWeekWorkouts,
    stepEntries,
    foodEntries,
    currentStreak,
    bmiData,
    suggestedMacros,
    setActiveTab,
    incrementWater,
    addStepsQuick,
  } = useFitness();

  // Calorie calculations
  const calorieTarget = profile.dailyCalorieTarget;
  const caloriesRemaining = calorieTarget - currentDayCalories;
  const caloriePercent = Math.min(100, Math.round((currentDayCalories / calorieTarget) * 100));

  // Step calculations
  const stepGoal = profile.dailyStepGoal;
  const stepPercent = Math.min(100, Math.round((currentDaySteps / stepGoal) * 100));
  const estimatedKm = ((currentDaySteps * 0.762) / 1000).toFixed(1);

  // Water calculations
  const waterGoal = profile.dailyWaterGoal;
  const waterPercent = Math.min(100, Math.round((currentDayWater / waterGoal) * 100));

  // Workout calculations
  const weeklyWorkoutCount = thisWeekWorkouts.length;
  const weeklyWorkoutGoal = profile.weeklyWorkoutGoal;
  const workoutPercent = Math.min(100, Math.round((weeklyWorkoutCount / weeklyWorkoutGoal) * 100));
  const weeklyTotalMins = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const weeklyCaloriesBurned = thisWeekWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  // 7-day average metrics
  const last7DaysSteps = stepEntries.slice(0, 7);
  const avgSteps = last7DaysSteps.length > 0
    ? Math.round(last7DaysSteps.reduce((acc, s) => acc + s.steps, 0) / last7DaysSteps.length)
    : 0;

  // Recent 7 days average calories
  const recentDays = Array.from(new Set(foodEntries.map(f => f.date))).slice(0, 7);
  const totalRecentCal = recentDays.reduce((sum, date) => {
    return sum + foodEntries.filter(f => f.date === date).reduce((cSum, f) => cSum + f.calories, 0);
  }, 0);
  const avgCalories = recentDays.length > 0 ? Math.round(totalRecentCal / recentDays.length) : currentDayCalories;

  // Weight delta
  const weightDiff = profile.weight - profile.targetWeight;
  const isWeightGoalLost = profile.goal === 'lose_weight';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Hero Welcome & Streak Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 border border-emerald-100/90 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 dark:border-slate-800 p-4 sm:p-8 shadow-xs transition-colors duration-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Fitness Center</span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-slate-600 dark:text-slate-400 capitalize">{profile.goal.replace('_', ' ')}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Good day, {profile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              You are on a <span className="text-amber-600 dark:text-amber-400 font-bold">{currentStreak}-day active streak</span>. 
              {caloriesRemaining > 0 
                ? ` You have ${caloriesRemaining.toLocaleString()} kcal remaining for your target today.`
                : ` You reached your daily calorie target for today!`}
            </p>
          </div>

          {/* Quick Metrics Bar on Hero */}
          <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-4 bg-white/90 dark:bg-slate-850/80 p-2.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-sm w-full sm:w-auto">
            <div className="text-center px-3">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weight</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {profile.unitPreference.weight === 'lbs' ? `${kgToLbs(profile.weight)} lbs` : `${profile.weight} kg`}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5 font-medium">
                {isWeightGoalLost ? (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>{Math.abs(weightDiff).toFixed(1)}kg to goal</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.abs(weightDiff).toFixed(1)}kg to goal</span>
                  </>
                )}
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />

            <div className="text-center px-3">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">BMI</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{bmiData.bmi}</div>
              <div className={`text-[10px] font-semibold ${bmiData.color} mt-0.5`}>
                {bmiData.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Cards with Visual Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Steps */}
        <div 
          onClick={() => setActiveTab('steps')}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Steps</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {currentDaySteps.toLocaleString()}
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <StatRing value={currentDaySteps} max={stepGoal} size={74} strokeWidth={7} color="#10b981">
              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{stepPercent}%</span>
            </StatRing>

            <div className="space-y-1.5 text-right text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Goal: <span className="text-slate-800 dark:text-slate-200 font-semibold tabular-nums">{stepGoal.toLocaleString()}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Est: <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{estimatedKm} km</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addStepsQuick(500);
                }}
                className="mt-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25 dark:border-transparent transition-colors"
              >
                +500 steps
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Calories & Diet */}
        <div 
          onClick={() => setActiveTab('diet')}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nutrition</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {currentDayCalories.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">kcal</span>
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <StatRing value={currentDayCalories} max={calorieTarget} size={74} strokeWidth={7} color="#f59e0b">
              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{caloriePercent}%</span>
            </StatRing>

            <div className="space-y-1 text-right text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Target: <span className="text-slate-800 dark:text-slate-200 font-semibold tabular-nums">{calorieTarget}</span>
              </div>
              <div className={caloriesRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                {caloriesRemaining >= 0 ? `${caloriesRemaining} left` : `${Math.abs(caloriesRemaining)} over`}
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                P: <span className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(currentDayMacros.protein)}g</span> · C: <span className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(currentDayMacros.carbs)}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Water Intake */}
        <div 
          onClick={() => setActiveTab('diet')}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hydration</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {currentDayWater} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ {waterGoal} glasses</span>
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <StatRing value={currentDayWater} max={waterGoal} size={74} strokeWidth={7} color="#06b6d4">
              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{waterPercent}%</span>
            </StatRing>

            <div className="space-y-1.5 text-right text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Vol: <span className="text-cyan-600 dark:text-cyan-400 font-semibold tabular-nums">{currentDayWater * 250} ml</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-[11px]">
                Goal: {waterGoal * 250} ml
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  incrementWater(1);
                }}
                className="mt-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200/60 dark:bg-cyan-500/15 dark:text-cyan-400 dark:hover:bg-cyan-500/25 dark:border-transparent transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>1 Glass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Workouts */}
        <div 
          onClick={() => setActiveTab('workouts')}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-violet-500/40 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workouts</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {weeklyWorkoutCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">this week</span>
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <StatRing value={weeklyWorkoutCount} max={weeklyWorkoutGoal} size={74} strokeWidth={7} color="#8b5cf6">
              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{workoutPercent}%</span>
            </StatRing>

            <div className="space-y-1.5 text-right text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Target: <span className="text-slate-800 dark:text-slate-200 font-semibold tabular-nums">{weeklyWorkoutGoal} / wk</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Burned: <span className="text-violet-600 dark:text-violet-400 font-semibold tabular-nums">{weeklyCaloriesBurned} kcal</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-[11px]">
                {weeklyTotalMins} active mins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Macro Breakdown Progress + Weekly Summary Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Macro Breakdown & Nutrition Target Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Today's Macronutrient Distribution</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Caloric intake balance based on your {profile.goal.replace('_', ' ')} strategy
              </p>
            </div>
            <button
              onClick={() => setActiveTab('diet')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Food Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Macro Bars */}
          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Protein
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white font-bold">{Math.round(currentDayMacros.protein)}g</strong> / {suggestedMacros.protein}g ({Math.round(suggestedMacros.protein > 0 ? (currentDayMacros.protein / suggestedMacros.protein) * 100 : 0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentDayMacros.protein / suggestedMacros.protein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Carbohydrates
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white font-bold">{Math.round(currentDayMacros.carbs)}g</strong> / {suggestedMacros.carbs}g ({Math.round(suggestedMacros.carbs > 0 ? (currentDayMacros.carbs / suggestedMacros.carbs) * 100 : 0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentDayMacros.carbs / suggestedMacros.carbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Healthy Fats
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white font-bold">{Math.round(currentDayMacros.fats)}g</strong> / {suggestedMacros.fats}g ({Math.round(suggestedMacros.fats > 0 ? (currentDayMacros.fats / suggestedMacros.fats) * 100 : 0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentDayMacros.fats / suggestedMacros.fats) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick action pill row */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('diet')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-transparent"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Log Meal</span>
            </button>
            <button
              onClick={() => setActiveTab('workouts')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-transparent"
            >
              <Plus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Log Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-transparent"
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Manual Steps</span>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-transparent"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Record Weight</span>
            </button>
          </div>
        </div>

        {/* Right Col: Weekly Summary Report Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Weekly Performance</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">7-Day Rolling</span>
          </div>

          <div className="space-y-3.5">
            {/* Avg Steps */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Step Avg</span>
                <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{avgSteps.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${avgSteps >= stepGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {avgSteps >= stepGoal ? 'Goal On Track' : 'Below Goal'}
                </span>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Target: {stepGoal.toLocaleString()}</div>
              </div>
            </div>

            {/* Avg Calories */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Calorie Avg</span>
                <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{avgCalories.toLocaleString()} kcal</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.abs(avgCalories - calorieTarget) < 150 ? 'Optimal' : `${avgCalories > calorieTarget ? '+' : ''}${avgCalories - calorieTarget} kcal`}
                </span>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Target: {calorieTarget} kcal</div>
              </div>
            </div>

            {/* Total Workouts */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Workouts</span>
                <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {weeklyWorkoutCount} sessions
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{weeklyTotalMins} mins</span>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{weeklyCaloriesBurned} kcal burned</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('progress')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold dark:text-slate-200 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-transparent"
          >
            <span>View Comprehensive Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Today's Logged Workouts & Meals Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workouts Logged Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workouts Done Today</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {currentDayWorkouts.length} logged
            </span>
          </div>

          {currentDayWorkouts.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800">
              <Dumbbell className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No workout logged yet today.</p>
              <button
                onClick={() => setActiveTab('workouts')}
                className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/60 dark:bg-violet-500/15 dark:text-violet-400 dark:hover:bg-violet-500/25 dark:border-transparent transition-colors cursor-pointer"
              >
                Log First Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentDayWorkouts.map(w => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{w.exerciseName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {w.category} · {w.sets} sets × {w.reps} reps {w.weight > 0 ? `@ ${w.weight}kg` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 tabular-nums">
                      {w.caloriesBurned} kcal
                    </span>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{w.duration} mins</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Meals Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Meals</h3>
            </div>
            <button
              onClick={() => setActiveTab('diet')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
            >
              Add Food +
            </button>
          </div>

          {foodEntries.filter(f => f.date === selectedDate).length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800">
              <Flame className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No food logged for {formatDateLabel(selectedDate)}.</p>
              <button
                onClick={() => setActiveTab('diet')}
                className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25 dark:border-transparent transition-colors cursor-pointer"
              >
                Log Your First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {foodEntries
                .filter(f => f.date === selectedDate)
                .slice(0, 4)
                .map(f => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{f.foodName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                        {f.mealType} · {f.quantity}{f.servingUnit || 'g'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                        {f.calories} kcal
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        P: {f.protein}g · C: {f.carbs}g
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
