import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { COMMON_FOOD_DATABASE } from '../../data/foodDatabase';
import { FoodItemTemplate, MealType } from '../../types/fitness';
import {
  Utensils,
  Search,
  Plus,
  Trash2,
  Droplets,
  Flame,
  PieChart as PieIcon,
  ChevronDown,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDateLabel } from '../../utils/fitnessCalculations';

const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🥩' },
  { id: 'snack', label: 'Snacks & Drinks', icon: '🍎' },
];

export const DietTracker: React.FC = () => {
  const {
    profile,
    foodEntries,
    selectedDate,
    currentDayCalories,
    currentDayMacros,
    currentDayWater,
    suggestedMacros,
    addFoodEntry,
    deleteFoodEntry,
    incrementWater,
    logWater,
  } = useFitness();

  // Search & Filter state for food database
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');

  // Portion modal or inline selection
  const [selectedFoodTemplate, setSelectedFoodTemplate] = useState<FoodItemTemplate | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);

  // Custom food manual entry state
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');

  // Daily calorie calculations
  const calorieTarget = profile.dailyCalorieTarget;
  const remainingCalories = calorieTarget - currentDayCalories;
  const caloriePercentage = Math.min(100, Math.round((currentDayCalories / calorieTarget) * 100));

  // Filter foods logged today
  const todayFoodEntries = useMemo(() => {
    return foodEntries.filter(f => f.date === selectedDate);
  }, [foodEntries, selectedDate]);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(COMMON_FOOD_DATABASE.map(f => f.category)));
    return ['All', ...cats];
  }, []);

  // Filtered food library
  const filteredDatabase = useMemo(() => {
    return COMMON_FOOD_DATABASE.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  // Handle clicking a food item from DB
  const handleSelectFood = (food: FoodItemTemplate) => {
    setSelectedFoodTemplate(food);
    setPortionGrams(food.defaultServingGrams);
  };

  // Add selected food template with chosen portion
  const handleAddTemplateFood = () => {
    if (!selectedFoodTemplate || portionGrams <= 0) return;
    const ratio = portionGrams / 100;
    addFoodEntry({
      date: selectedDate,
      mealType: activeMealType,
      foodName: selectedFoodTemplate.name,
      calories: Math.round(selectedFoodTemplate.caloriesPer100g * ratio),
      protein: Number((selectedFoodTemplate.proteinPer100g * ratio).toFixed(1)),
      carbs: Number((selectedFoodTemplate.carbsPer100g * ratio).toFixed(1)),
      fats: Number((selectedFoodTemplate.fatsPer100g * ratio).toFixed(1)),
      quantity: portionGrams,
      servingUnit: 'g',
    });
    setSelectedFoodTemplate(null);
  };

  // Add custom food
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addFoodEntry({
      date: selectedDate,
      mealType: activeMealType,
      foodName: customName.trim(),
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fats: Number(customFats) || 0,
      quantity: 1,
      servingUnit: 'serving',
    });

    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    setIsCustomFormOpen(false);
  };

  // Recharts macro pie data
  const pieData = useMemo(() => {
    const pCals = currentDayMacros.protein * 4;
    const cCals = currentDayMacros.carbs * 4;
    const fCals = currentDayMacros.fats * 9;
    const total = pCals + cCals + fCals;
    if (total === 0) {
      return [
        { name: 'Protein', value: 30, color: '#10b981' },
        { name: 'Carbs', value: 45, color: '#f59e0b' },
        { name: 'Fats', value: 25, color: '#f43f5e' },
      ];
    }
    return [
      { name: 'Protein', value: Math.round(pCals), color: '#10b981', grams: Math.round(currentDayMacros.protein) },
      { name: 'Carbs', value: Math.round(cCals), color: '#f59e0b', grams: Math.round(currentDayMacros.carbs) },
      { name: 'Fats', value: Math.round(fCals), color: '#f43f5e', grams: Math.round(currentDayMacros.fats) },
    ];
  }, [currentDayMacros]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Nutrition & Macro Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Diet & Calories</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log meals, balance your macronutrients, and monitor daily water consumption.
          </p>
        </div>

        {/* Calorie Progress Pill */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Calorie Budget</span>
            <span className="tabular-nums font-bold text-slate-900 dark:text-white">
              {currentDayCalories} / {calorieTarget} kcal
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remainingCalories >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span>{caloriePercentage}% consumed</span>
            <span className={remainingCalories >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
              {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `${Math.abs(remainingCalories)} kcal over`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Macro Pie + Interactive Water Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Macro Breakdown</h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Target %</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{data.name}: </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{data.value} kcal ({data.grams}g)</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">{currentDayCalories}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">kcal</span>
            </div>
          </div>

          {/* Macro Legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-slate-800/50 border border-emerald-100 dark:border-transparent">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Protein</div>
              <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{Math.round(currentDayMacros.protein)}g</div>
              <div className="text-[10px] text-slate-500">Goal: {suggestedMacros.protein}g</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-slate-800/50 border border-amber-100 dark:border-transparent">
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Carbs</div>
              <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{Math.round(currentDayMacros.carbs)}g</div>
              <div className="text-[10px] text-slate-500">Goal: {suggestedMacros.carbs}g</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-slate-800/50 border border-rose-100 dark:border-transparent">
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">Fats</div>
              <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{Math.round(currentDayMacros.fats)}g</div>
              <div className="text-[10px] text-slate-500">Goal: {suggestedMacros.fats}g</div>
            </div>
          </div>
        </div>

        {/* Water Intake Tracker Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Hydration Tracker</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {profile.dailyWaterGoal} glasses ({profile.dailyWaterGoal * 250} ml / day)
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
                {currentDayWater * 250}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400"> / {profile.dailyWaterGoal * 250} ml</span>
            </div>
          </div>

          {/* Interactive Glasses Row */}
          <div className="space-y-2">
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Tap a glass to set your hydration level:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentDayWater} / {profile.dailyWaterGoal} glasses</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2">
              {Array.from({ length: Math.max(8, profile.dailyWaterGoal) }).map((_, idx) => {
                const isFilled = idx < currentDayWater;
                return (
                  <button
                    key={idx}
                    onClick={() => logWater(idx + 1 === currentDayWater ? idx : idx + 1)}
                    className={`w-10 h-12 rounded-xl flex flex-col items-center justify-end pb-1.5 transition-all transform active:scale-95 border cursor-pointer ${
                      isFilled
                        ? 'bg-gradient-to-t from-cyan-500 to-sky-400 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-400 hover:border-slate-400'
                    }`}
                    title={`Glass ${idx + 1} (250ml)`}
                  >
                    <Droplets className={`w-4 h-4 ${isFilled ? 'fill-white stroke-[2]' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-bold mt-0.5">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs text-slate-500">1 standard glass ≈ 250 ml (8.4 fl oz)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => incrementWater(-1)}
                disabled={currentDayWater <= 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                - 1 Glass
              </button>
              <button
                onClick={() => incrementWater(1)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Glass</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Food Database & Quick Add Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Food Database & Quick Add</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select verified items from the 50-food library or add a custom meal.
            </p>
          </div>

          {/* Meal type selector tab bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
            {MEAL_TYPES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMealType(m.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMealType === m.id
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 dark:bg-emerald-500 dark:text-slate-950 dark:border-transparent font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chicken breast, oats, avocado, whey..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isCustomFormOpen ? 'Close Custom Form' : 'Custom Entry'}</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-xs dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom food entry form if open */}
        {isCustomFormOpen && (
          <form onSubmit={handleAddCustom} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-emerald-300/80 dark:border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Add Custom Food to {activeMealType.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setIsCustomFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Lentil Soup"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="320"
                  value={customCalories}
                  onChange={e => setCustomCalories(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="24"
                  value={customProtein}
                  onChange={e => setCustomProtein(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                  Carbs / Fats (g)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="C"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                    title="Carbohydrates (g)"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="F"
                    value={customFats}
                    onChange={e => setCustomFats(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                    title="Fats (g)"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomFormOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Add Meal
              </button>
            </div>
          </form>
        )}

        {/* Database Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {filteredDatabase.map(item => (
            <div
              key={item.id}
              onClick={() => handleSelectFood(item)}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                    {item.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {item.servingLabel}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/70 text-[11px]">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                  {item.caloriesPer100g} kcal <span className="font-normal text-slate-500 text-[10px]">/ 100g</span>
                </span>
                <span className="text-slate-500 font-medium">
                  P: <strong className="text-slate-800">{item.proteinPer100g}g</strong> · C: <strong className="text-slate-800">{item.carbsPer100g}g</strong> · F: <strong className="text-slate-800">{item.fatsPer100g}g</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Food Portion Modal */}
      {selectedFoodTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                  Add to {activeMealType}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {selectedFoodTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFoodTemplate(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Serving input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Portion Quantity (Grams)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  step="5"
                  value={portionGrams}
                  onChange={e => setPortionGrams(Math.max(5, Number(e.target.value)))}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-500 tabular-nums"
                />
                <span className="text-xs text-slate-500 font-medium">grams</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[50, 100, 150, 200, selectedFoodTemplate.defaultServingGrams].map((g, idx) => (
                  <button
                    key={`${g}-${idx}`}
                    type="button"
                    onClick={() => setPortionGrams(g)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Scaled Macro Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Calories</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                  {Math.round(selectedFoodTemplate.caloriesPer100g * (portionGrams / 100))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Protein</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                  {(selectedFoodTemplate.proteinPer100g * (portionGrams / 100)).toFixed(1)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Carbs</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                  {(selectedFoodTemplate.carbsPer100g * (portionGrams / 100)).toFixed(1)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Fats</div>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                  {(selectedFoodTemplate.fatsPer100g * (portionGrams / 100)).toFixed(1)}g
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFoodTemplate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTemplateFood}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Confirm & Log Food
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Logged Food List (Categorized by Meal) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Meals Logged for {formatDateLabel(selectedDate)}
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            Total: {currentDayCalories} kcal
          </span>
        </div>

        {todayFoodEntries.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800">
            <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No food logged for this day yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Choose an item from the library above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_TYPES.map(meal => {
              const items = todayFoodEntries.filter(f => f.mealType === meal.id);
              if (items.length === 0) return null;
              const mealCalories = items.reduce((sum, i) => sum + i.calories, 0);

              return (
                <div key={meal.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meal.icon}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{meal.label}</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">{mealCalories} kcal</span>
                  </div>

                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-white dark:hover:bg-slate-800/60 transition-colors text-xs"
                      >
                        <div className="flex-1 pr-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.foodName}</span>
                          <span className="text-slate-500 ml-2 text-[11px]">({item.quantity}{item.servingUnit || 'g'})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{item.calories} kcal</span>
                            <div className="text-[10px] text-slate-500">
                              P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g
                            </div>
                          </div>
                          <button
                            onClick={() => deleteFoodEntry(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
