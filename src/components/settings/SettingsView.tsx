import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import {
  ActivityLevel,
  FitnessGoal,
  Gender,
  HeightUnit,
  WeightUnit,
} from '../../types/fitness';
import {
  Settings,
  User,
  Sliders,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Download,
  ShieldAlert,
  Check,
  Target,
  LogOut,
  Cloud,
  KeyRound,
  Mail,
} from 'lucide-react';
import { calculateBMR, calculateCalorieTarget, calculateTDEE } from '../../utils/fitnessCalculations';
import { LogoutModal } from '../auth/LogoutModal';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    resetAllData,
    loadSampleData,
    toggleTheme,
    showToast,
    isSyncing,
  } = useFitness();
  const { currentUser, logOut, resetPassword } = useAuth();

  // Local state for profile edits
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);

  // Custom goals
  const [dailyStepGoal, setDailyStepGoal] = useState(profile.dailyStepGoal);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(profile.dailyCalorieTarget);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(profile.dailyWaterGoal);
  const [weeklyWorkoutGoal, setWeeklyWorkoutGoal] = useState(profile.weeklyWorkoutGoal);

  // Unit preferences
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(profile.unitPreference.weight);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(profile.unitPreference.height);

  // Confirmation dialogs
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto Recalculate helper
  const handleRecalculateCalorieTarget = () => {
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const calculated = calculateCalorieTarget(tdee, goal);
    setDailyCalorieTarget(calculated);
    showToast('Target Recalculated ⚡', `Updated daily budget to ${calculated} kcal.`);
  };

  // Save profile and goals
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim(),
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      activityLevel,
      goal,
      dailyStepGoal: Number(dailyStepGoal),
      dailyCalorieTarget: Number(dailyCalorieTarget),
      dailyWaterGoal: Number(dailyWaterGoal),
      weeklyWorkoutGoal: Number(weeklyWorkoutGoal),
      unitPreference: {
        weight: weightUnit,
        height: heightUnit,
      },
    });
    showToast('Settings Saved ✅', 'Your profile and targets are synchronized to Firestore.');
  };

  const handlePasswordResetRequest = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      showToast('Reset Email Sent 📬', `Password reset instructions sent to ${currentUser.email}.`);
    } catch {
      showToast('Error', 'Unable to send password reset email.', 'info');
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      setIsLogoutModalOpen(false);
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Backup / Export
  const handleExportData = () => {
    try {
      const data = {
        profile,
        user: {
          uid: currentUser?.uid,
          email: currentUser?.email,
        },
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export Complete 💾', 'Backup file saved to your device.');
    } catch {
      showToast('Error', 'Failed to export data.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-14">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Preferences & Account Settings</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings & Goals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal biology metrics, custom daily targets, units, and authentication.
          </p>
        </div>

        {/* Theme quick toggle */}
        <button
          onClick={toggleTheme}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          {profile.theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Switch to Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Switch to Dark Theme</span>
            </>
          )}
        </button>
      </div>

      {/* Account & Cloud Authentication Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Cloud Authentication & Storage</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Firebase Auth & Cloud Firestore</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Connected</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Account Email</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{currentUser?.email || profile.email}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Firestore User ID</span>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {currentUser?.uid || 'Local fallback'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {currentUser?.email && !currentUser.isAnonymous && (
            <button
              type="button"
              onClick={handlePasswordResetRequest}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Send Password Reset Email</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: User Profile & Bio Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">User Bio & Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="12"
                max="120"
                required
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                min="90"
                max="250"
                required
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                value={targetWeight}
                onChange={e => setTargetWeight(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Biological Gender & Activity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Gender (Mifflin-St Jeor)
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="male">Male (+5 kcal)</option>
                <option value="female">Female (-161 kcal)</option>
                <option value="other">Other / Neutral (-78 kcal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Activity Multiplier
              </label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="sedentary">Sedentary (1.2x)</option>
                <option value="light">Lightly Active (1.375x)</option>
                <option value="moderate">Moderately Active (1.55x)</option>
                <option value="active">Active (1.725x)</option>
                <option value="very_active">Very Active (1.9x)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Custom Goals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Custom Fitness Goals</h2>
            </div>
            <button
              type="button"
              onClick={handleRecalculateCalorieTarget}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Calculate from BMR</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Step Goal
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                step="500"
                required
                value={dailyStepGoal}
                onChange={e => setDailyStepGoal(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Standard benchmark: 10,000 steps</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Calorie Budget (kcal)
              </label>
              <input
                type="number"
                min="1000"
                max="8000"
                step="50"
                required
                value={dailyCalorieTarget}
                onChange={e => setDailyCalorieTarget(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Adjusts target for weight loss / surplus</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Water Goal (Glasses)
              </label>
              <input
                type="number"
                min="4"
                max="30"
                required
                value={dailyWaterGoal}
                onChange={e => setDailyWaterGoal(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">{dailyWaterGoal * 250} ml per day</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Workouts / Week
              </label>
              <input
                type="number"
                min="1"
                max="14"
                required
                value={weeklyWorkoutGoal}
                onChange={e => setWeeklyWorkoutGoal(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Typically 3 to 5 sessions</span>
            </div>
          </div>
        </div>

        {/* Section 3: Units & Display */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Units & Measurement</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['kg', 'lbs'] as WeightUnit[]).map(u => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setWeightUnit(u)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                      weightUnit === u
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-xs dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Height Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cm', label: 'Centimeters (cm)' },
                  { id: 'ft_in', label: 'Feet & In' },
                ].map(u => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setHeightUnit(u.id as HeightUnit)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      heightUnit === u.id
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-xs dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Save Changes to Cloud</span>
        </button>
      </form>

      {/* Section 4: Data Management & Cloud Sync */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Data Management & Cloud Synchronization</h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          All your logged steps, meals, workouts, weights, and water entries are continuously synchronized to Google Cloud Firestore with real-time listeners.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={loadSampleData}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load Sample 14-Day Data to Cloud</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>Export Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear / Reset Firestore Tracking Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset All Tracking Data?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                This will purge all your logged steps, meals, workouts, weights, and hydration records from Cloud Firestore.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetAllData(true);
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
};
