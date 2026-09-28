import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { StatRing } from '../common/StatRing';
import {
  Footprints,
  Flame,
  Milestone,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatDateLabel, getTodayDateString } from '../../utils/fitnessCalculations';

export const StepTracker: React.FC = () => {
  const {
    profile,
    stepEntries,
    selectedDate,
    currentDaySteps,
    currentStreak,
    logSteps,
    addStepsQuick,
    updateProfile,
    setSelectedDate,
  } = useFitness();

  const [inputSteps, setInputSteps] = useState<string>('');
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalDraft, setGoalDraft] = useState<number>(profile.dailyStepGoal);
  const [chartRange, setChartRange] = useState<'7d' | '14d' | '30d'>('7d');

  const stepGoal = profile.dailyStepGoal;
  const percentage = Math.min(100, Math.round((currentDaySteps / stepGoal) * 100));
  const estimatedKm = ((currentDaySteps * 0.762) / 1000).toFixed(2);
  const estimatedMiles = ((currentDaySteps * 0.762) / 1609.34).toFixed(2);
  const caloriesBurned = Math.round(currentDaySteps * 0.04);

  // Filter and sort history for Recharts
  const chartData = useMemo(() => {
    const daysCount = chartRange === '7d' ? 7 : chartRange === '14d' ? 14 : 30;
    const now = new Date();
    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const entry = stepEntries.find(s => s.date === dateKey);
      const steps = entry ? entry.steps : 0;

      result.push({
        dateKey,
        label: i === 0 ? 'Today' : formatDateLabel(dateKey),
        steps,
        goal: stepGoal,
        isMet: steps >= stepGoal,
      });
    }

    return result;
  }, [stepEntries, chartRange, stepGoal]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputSteps, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      logSteps(parsed, selectedDate);
      setInputSteps('');
    }
  };

  const handleSaveGoal = () => {
    if (goalDraft >= 1000) {
      updateProfile({ dailyStepGoal: goalDraft });
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Footprints className="w-4 h-4" />
            <span>Pedometer & Mobility Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Step Tracking</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log your daily movement and maintain your consecutive activity streak.
          </p>
        </div>

        {/* Daily Goal Quick Edit */}
        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Daily Goal</div>
            {isEditingGoal ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  step="500"
                  min="1000"
                  max="50000"
                  value={goalDraft}
                  onChange={e => setGoalDraft(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white tabular-nums"
                />
                <button
                  onClick={handleSaveGoal}
                  className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                  title="Save Goal"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {stepGoal.toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    setGoalDraft(stepGoal);
                    setIsEditingGoal(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  title="Edit Goal"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />

          {/* Active Streak */}
          <div className="text-center px-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Streak</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{currentStreak} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Ring & Progress + Quick Log Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ring & Today Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Selected Day: <span className="text-slate-900 dark:text-slate-200 font-bold">{formatDateLabel(selectedDate)}</span>
          </span>

          <StatRing value={currentDaySteps} max={stepGoal} size={168} strokeWidth={14} color="#10b981">
            <Footprints className="w-7 h-7 text-emerald-500 dark:text-emerald-400 mb-1" />
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {currentDaySteps.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {percentage}% of goal
            </span>
          </StatRing>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-transparent">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Milestone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Distance</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {profile.unitPreference.weight === 'lbs' ? `${estimatedMiles} mi` : `${estimatedKm} km`}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-transparent">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Est Burn</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {caloriesBurned} kcal
              </div>
            </div>
          </div>
        </div>

        {/* Step Logging Center: Quick Buttons + Manual Input */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Update Step Count</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly increment your step count or type the exact total for {formatDateLabel(selectedDate)}.
            </p>

            {/* Quick Add Increment Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {[500, 1000, 2500, 5000].map(val => (
                <button
                  key={val}
                  onClick={() => addStepsQuick(val)}
                  className="py-3 px-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-500/10 dark:border-slate-700/60 dark:text-slate-200 dark:hover:text-emerald-400 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">+{val.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">steps</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exact Total Input Form */}
          <form onSubmit={handleManualSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Set Exact Total Steps for {formatDateLabel(selectedDate)}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100000"
                placeholder={`Current: ${currentDaySteps}`}
                value={inputSteps}
                onChange={e => setInputSteps(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white tabular-nums transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Save Steps
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* History Bar Chart Section with Recharts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Step History & Trends</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily walk volume with daily goal benchmark ({stepGoal.toLocaleString()} steps)
            </p>
          </div>

          {/* Time range selector tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  chartRange === range
                    ? 'bg-white text-emerald-700 border border-emerald-200 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={val => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">{data.label}</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                          {data.steps.toLocaleString()} steps
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                          Goal: {data.goal.toLocaleString()} ({data.isMet ? 'Met 🎉' : 'Short'})
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={stepGoal}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: 'Goal', fill: '#10b981', fontSize: 10, position: 'top' }}
              />
              <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.dateKey === selectedDate ? '#10b981' : entry.isMet ? '#059669' : '#e2e8f0'}
                    className="cursor-pointer transition-colors hover:opacity-80"
                    onClick={() => setSelectedDate(entry.dateKey)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
