import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Scale,
  Award,
  Calendar,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { formatDateLabel, getTodayDateString, kgToLbs } from '../../utils/fitnessCalculations';

export const ProgressAnalytics: React.FC = () => {
  const {
    profile,
    weightEntries,
    stepEntries,
    foodEntries,
    workoutEntries,
    selectedDate,
    bmiData,
    logWeight,
    deleteWeight,
  } = useFitness();

  const [inputWeight, setInputWeight] = useState<string>('');
  const [weightDate, setWeightDate] = useState<string>(selectedDate);
  const [weightNote, setWeightNote] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Unit helper
  const unit = profile.unitPreference.weight;
  const targetWeight = unit === 'lbs' ? kgToLbs(profile.targetWeight) : profile.targetWeight;
  const currentWeight = unit === 'lbs' ? kgToLbs(profile.weight) : profile.weight;

  // Sorted weight line chart data
  const chartData = useMemo(() => {
    return [...weightEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => {
        const val = unit === 'lbs' ? kgToLbs(entry.weight) : entry.weight;
        return {
          id: entry.id,
          dateKey: entry.date,
          label: formatDateLabel(entry.date),
          weight: val,
          note: entry.note,
        };
      });
  }, [weightEntries, unit]);

  // Overall weight progress stats
  const initialWeightEntry = chartData[0];
  const latestWeightEntry = chartData[chartData.length - 1];
  const totalChange = initialWeightEntry && latestWeightEntry
    ? Number((latestWeightEntry.weight - initialWeightEntry.weight).toFixed(1))
    : 0;

  // BMI Gauge markers
  const bmiRanges = [
    { label: 'Underweight', min: 0, max: 18.5, color: 'bg-amber-400' },
    { label: 'Normal', min: 18.5, max: 24.9, color: 'bg-emerald-400' },
    { label: 'Overweight', min: 25.0, max: 29.9, color: 'bg-amber-400' },
    { label: 'Obese', min: 30.0, max: 40.0, color: 'bg-rose-400' },
  ];

  // Handle weight submit
  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputWeight);
    if (!isNaN(parsed) && parsed > 0) {
      // If user typed in lbs, convert to kg for internal storage
      const weightInKg = unit === 'lbs' ? parsed / 2.20462 : parsed;
      logWeight(weightInKg, weightDate, weightNote.trim() || undefined);
      setInputWeight('');
      setWeightNote('');
      setIsModalOpen(false);
    }
  };

  // 30-day overview averages
  const avgDailySteps = useMemo(() => {
    if (!stepEntries.length) return 0;
    return Math.round(stepEntries.reduce((s, e) => s + e.steps, 0) / stepEntries.length);
  }, [stepEntries]);

  const totalCaloriesTracked = useMemo(() => {
    return foodEntries.reduce((s, e) => s + e.calories, 0);
  }, [foodEntries]);

  const totalWorkoutsCount = workoutEntries.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Health Analytics & Body Metrics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Progress & Trends</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze weight evolution, body composition, and cumulative fitness milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record New Weight</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Current Weight
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {currentWeight} <span className="text-xs font-normal text-slate-500">{unit}</span>
          </div>
          <div className="text-xs text-slate-500 pt-1">
            Target: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{targetWeight} {unit}</strong>
          </div>
        </div>

        {/* Card 2: Net Change */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Overall Change
          </div>
          <div className={`text-2xl font-black tabular-nums flex items-center gap-1.5 ${
            totalChange < 0 ? 'text-emerald-600 dark:text-emerald-400' : totalChange > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700'
          }`}>
            {totalChange < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            <span>{totalChange > 0 ? `+${totalChange}` : totalChange} {unit}</span>
          </div>
          <div className="text-xs text-slate-500 pt-1">
            Since first log ({initialWeightEntry ? initialWeightEntry.label : 'N/A'})
          </div>
        </div>

        {/* Card 3: Average Daily Steps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Daily Steps
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {avgDailySteps.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
            {avgDailySteps >= profile.dailyStepGoal ? 'Goal Exceeded' : `${profile.dailyStepGoal - avgDailySteps} to daily goal`}
          </div>
        </div>

        {/* Card 4: Total Completed Workouts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Workouts Logged
          </div>
          <div className="text-2xl font-black text-violet-700 dark:text-violet-400 tabular-nums">
            {totalWorkoutsCount} <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
          <div className="text-xs text-slate-500 pt-1">
            {workoutEntries.reduce((s, w) => s + w.caloriesBurned, 0).toLocaleString()} total kcal burned
          </div>
        </div>
      </div>

      {/* Weight History Line Chart Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Weight Progression Over Time</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical weigh-ins plotted against your target goal line ({targetWeight} {unit})
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Weight Record
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
              Target Goal
            </span>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
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
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={val => `${val} ${unit}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">{data.label}</div>
                        <div className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm tabular-nums">
                          {data.weight} {unit}
                        </div>
                        {data.note && (
                          <div className="text-slate-500 italic">"{data.note}"</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={targetWeight}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `Goal: ${targetWeight} ${unit}`, fill: '#10b981', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BMI Calculator & Visual Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Body Mass Index (BMI)</h2>
            </div>
            <span className={`text-xs font-bold ${bmiData.color}`}>
              {bmiData.category}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            BMI is calculated as weight(kg) / height(m)². Current BMI for {profile.weight} kg and {profile.height} cm:
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between border border-slate-200/60 dark:border-transparent">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Your Current BMI</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">{bmiData.bmi}</div>
              <div className="text-xs text-slate-500 mt-1">{bmiData.description}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Normal Range</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">18.5 – 24.9</div>
            </div>
          </div>

          {/* Visual BMI Range Bar */}
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-amber-400 w-[18.5%]" title="Underweight (<18.5)" />
              <div className="h-full bg-emerald-500 w-[25%]" title="Normal (18.5-24.9)" />
              <div className="h-full bg-amber-400 w-[20%]" title="Overweight (25-29.9)" />
              <div className="h-full bg-rose-500 flex-1" title="Obese (>=30)" />
            </div>

            <div className="grid grid-cols-4 text-[10px] text-slate-500 font-medium text-center">
              <div>&lt; 18.5 (Under)</div>
              <div className="text-emerald-600 font-bold">18.5 - 24.9 (Normal)</div>
              <div>25 - 29.9 (Over)</div>
              <div>&ge; 30 (Obese)</div>
            </div>
          </div>
        </div>

        {/* Weight Log Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recent Weigh-Ins</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 cursor-pointer"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {chartData.slice().reverse().map(item => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {item.weight} {unit}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {item.label} {item.note ? `· "${item.note}"` : ''}
                  </div>
                </div>

                <button
                  onClick={() => deleteWeight(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Weight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Body Weight</h3>

            <form onSubmit={handleLogWeightSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  required
                  placeholder={`e.g. ${currentWeight}`}
                  value={inputWeight}
                  onChange={e => setInputWeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-cyan-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={weightDate}
                  onChange={e => setWeightDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fasted morning weigh-in"
                  value={weightNote}
                  onChange={e => setWeightNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
