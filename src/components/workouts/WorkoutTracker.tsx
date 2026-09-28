import React, { useState, useMemo, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { EXERCISE_PRESETS, ExercisePreset } from '../../data/exercisePresets';
import { WorkoutCategory, WorkoutEntry } from '../../types/fitness';
import { estimateWorkoutCalories, formatDateLabel } from '../../utils/fitnessCalculations';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Flame,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORIES: WorkoutCategory[] = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Other'];

export const WorkoutTracker: React.FC = () => {
  const {
    profile,
    workoutEntries,
    selectedDate,
    addWorkout,
    deleteWorkout,
    thisWeekWorkouts,
  } = useFitness();

  // Form state
  const [category, setCategory] = useState<WorkoutCategory>('Strength');
  const [exerciseName, setExerciseName] = useState<string>('');
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('08:00');

  // Filter for history list
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('All');

  // Rest Timer / Stopwatch tool
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Auto-estimate calories when duration or category changes
  useEffect(() => {
    const estimated = estimateWorkoutCalories(category, durationMins, profile.weight);
    setCaloriesBurned(estimated);
  }, [category, durationMins, profile.weight]);

  // Apply a preset exercise
  const handleSelectPreset = (preset: ExercisePreset) => {
    setCategory(preset.category);
    setExerciseName(preset.name);
    if (preset.defaultSets) setSets(preset.defaultSets);
    if (preset.defaultReps) setReps(preset.defaultReps);
    if (preset.defaultWeightKg !== undefined) setWeightKg(preset.defaultWeightKg);
    setDurationMins(preset.defaultDurationMins);
    setCaloriesBurned(Math.round(preset.defaultDurationMins * preset.caloriesPerMinute));
  };

  // Form submit
  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    addWorkout({
      date: selectedDate,
      time: timeStr || undefined,
      category,
      exerciseName: exerciseName.trim(),
      sets: Number(sets) || 1,
      reps: Number(reps) || 1,
      weight: Number(weightKg) || 0,
      duration: Number(durationMins) || 15,
      caloriesBurned: Number(caloriesBurned) || 100,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setExerciseName('');
    setNotes('');
  };

  // Filtered workout history
  const filteredHistory = useMemo(() => {
    return workoutEntries.filter(w => {
      if (historyCategoryFilter === 'All') return true;
      return w.category === historyCategoryFilter;
    });
  }, [workoutEntries, historyCategoryFilter]);

  // Weekly frequency chart data (last 7 days)
  const frequencyData = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      const count = workoutEntries.filter(w => w.date === dateKey).length;
      result.push({
        dateKey,
        label: i === 0 ? 'Today' : formatDateLabel(dateKey),
        count,
      });
    }
    return result;
  }, [workoutEntries]);

  // Filter presets for active category
  const activeCategoryPresets = useMemo(() => {
    return EXERCISE_PRESETS.filter(p => p.category === category);
  }, [category]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
            <Dumbbell className="w-4 h-4" />
            <span>Training & Workout Logger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Workouts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record resistance training, cardio sessions, intervals, and view weekly frequency.
          </p>
        </div>

        {/* Live Set / Rest Stopwatch widget */}
        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
          <div className="text-left">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Set / Rest Timer
            </div>
            <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatTimer(timerSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-2 rounded-xl text-white font-bold transition-transform active:scale-95 cursor-pointer shadow-xs ${
                isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              title={isTimerRunning ? 'Pause' : 'Start'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Logger + Weekly Frequency Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Workout Entry Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Log Exercise Session</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Logging for: <strong className="text-slate-900 dark:text-slate-200">{formatDateLabel(selectedDate)}</strong>
            </span>
          </div>

          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
              Discipline / Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    category === cat
                      ? 'bg-violet-50 text-violet-700 border-violet-300 shadow-xs dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets for Selected Category */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Popular {category} Templates
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeCategoryPresets.map(preset => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-violet-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-violet-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-white whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleLogWorkout} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Exercise / Workout Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell Deadlift or 5km Run"
                  value={exerciseName}
                  onChange={e => setExerciseName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  value={durationMins}
                  onChange={e => setDurationMins(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </div>
            </div>

            {/* Sets, Reps, Weight (kg) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Sets
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={sets}
                  onChange={e => setSets(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Reps / Set
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={reps}
                  onChange={e => setReps(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Weight ({profile.unitPreference.weight})
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={weightKg}
                  onChange={e => setWeightKg(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Calories Burned
                </label>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  value={caloriesBurned}
                  onChange={e => setCaloriesBurned(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-violet-700 dark:text-violet-300 font-bold focus:bg-white focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                Workout Notes & RPE (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Felt great, new PR on 3rd set, RPE 8.5"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout Entry</span>
            </button>
          </form>
        </div>

        {/* Right Col: Weekly Frequency Chart & Weekly Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Weekly Frequency</h2>
              <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-400 tabular-nums">
                {thisWeekWorkouts.length} / {profile.weeklyWorkoutGoal} sessions
              </span>
            </div>

            {/* Mini Recharts Bar for 7-day Workout count */}
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{data.label}: </span>
                            <span className="text-violet-600 dark:text-violet-400 font-semibold">{data.count} workouts</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {frequencyData.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.count > 0 ? '#8b5cf6' : '#e2e8f0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Weekly Stats */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Active Time</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {thisWeekWorkouts.reduce((s, w) => s + w.duration, 0)} minutes
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Calories Burned</span>
              <span className="font-bold text-violet-700 dark:text-violet-400 tabular-nums">
                {thisWeekWorkouts.reduce((s, w) => s + w.caloriesBurned, 0)} kcal
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Goal Completion</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {Math.round((thisWeekWorkouts.length / profile.weeklyWorkoutGoal) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Workout History Log</h2>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', ...CATEGORIES].map(f => (
              <button
                key={f}
                onClick={() => setHistoryCategoryFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  historyCategoryFilter === f
                    ? 'bg-violet-50 text-violet-800 border border-violet-200 shadow-xs dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800">
            <Dumbbell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No workout records found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map(w => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{w.exerciseName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
                      {w.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{formatDateLabel(w.date)}</span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span>{w.sets} sets × {w.reps} reps</span>
                    {w.weight > 0 && <span>@ {w.weight} {profile.unitPreference.weight}</span>}
                    <span>·</span>
                    <span>{w.duration} mins</span>
                    {w.notes && (
                      <span className="text-slate-700 dark:text-slate-300 italic">"{w.notes}"</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-violet-700 dark:text-violet-400 tabular-nums">
                      {w.caloriesBurned} kcal
                    </div>
                    <div className="text-[10px] text-slate-500">Burned</div>
                  </div>

                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
