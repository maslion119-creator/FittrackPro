import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { ActivityLevel, FitnessGoal, Gender } from '../../types/fitness';
import {
  calculateBMI,
  calculateBMR,
  calculateCalorieTarget,
  calculateTDEE,
} from '../../utils/fitnessCalculations';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, completeOnboarding } = useFitness();

  const [name, setName] = useState(profile.name || 'Alex');
  const [age, setAge] = useState(profile.age || 26);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [height, setHeight] = useState(profile.height || 175);
  const [weight, setWeight] = useState(profile.weight || 75);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight || 70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'lose_weight');

  // Live BMR and TDEE math
  const liveBMR = useMemo(() => {
    return calculateBMR(Number(weight), Number(height), Number(age), gender);
  }, [weight, height, age, gender]);

  const liveTDEE = useMemo(() => {
    return calculateTDEE(liveBMR, activityLevel);
  }, [liveBMR, activityLevel]);

  const liveCalorieTarget = useMemo(() => {
    return calculateCalorieTarget(liveTDEE, goal);
  }, [liveTDEE, goal]);

  const liveBMI = useMemo(() => {
    return calculateBMI(Number(weight), Number(height));
  }, [weight, height]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    completeOnboarding({
      name: name.trim(),
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      activityLevel,
      goal,
      dailyCalorieTarget: liveCalorieTarget,
      isOnboarded: true,
    });

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to FitTrack</h2>
          <p className="text-sm text-slate-600 mt-1">
            Let's calculate your optimal metabolic benchmarks and daily targets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                min={14}
                max={100}
                required
                value={age}
                onChange={e => setAge(Math.max(14, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Biological Gender (For Mifflin-St Jeor Formula)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as Gender[]).map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                    gender === g
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weights */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                min={100}
                max={250}
                required
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                required
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Goal (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                required
                value={targetWeight}
                onChange={e => setTargetWeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Daily Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="sedentary">Sedentary (desk job, minimal exercise)</option>
              <option value="light">Lightly Active (exercise 1-3 days/week)</option>
              <option value="moderate">Moderately Active (exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (physical job or 2x daily training)</option>
            </select>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Fitness Objective
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose_weight', label: 'Lose Fat', desc: '-500 kcal deficit' },
                { id: 'maintain', label: 'Maintain', desc: 'Equilibrium' },
                { id: 'build_muscle', label: 'Build Muscle', desc: '+350 kcal surplus' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setGoal(opt.id as FitnessGoal)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    goal === opt.id
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Output Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Calculated Metabolic Estimates
              </span>
              <span className="tabular-nums font-medium">BMI: {liveBMI.bmi} ({liveBMI.category})</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/60">
              <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Base BMR</div>
                <div className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">{liveBMR} kcal</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Total TDEE</div>
                <div className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">{liveTDEE} kcal</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
                <div className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Daily Target</div>
                <div className="text-sm font-black text-emerald-700 tabular-nums mt-0.5">{liveCalorieTarget} kcal</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            <span>Start Tracking Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
