import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { ActiveTab } from '../../types/fitness';
import {
  LayoutDashboard,
  Footprints,
  Utensils,
  Dumbbell,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'steps', label: 'Steps', icon: Footprints },
  { id: 'diet', label: 'Diet', icon: Utensils },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFitness();

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Natural Thumb Zone) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-1 pt-1 pb-safe shadow-lg select-none transition-colors duration-200"
      >
        <div className="grid grid-cols-6 items-center h-13 max-w-lg mx-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-0.5 rounded-xl transition-all relative min-w-0 w-full cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 active:text-emerald-600'
                }`}
              >
                <div className={`p-0.5 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-tight leading-tight truncate max-w-[54px] sm:max-w-none text-center">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 absolute bottom-0" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sub-Header Navigation Bar */}
      <div className="hidden md:block w-full bg-white/80 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/60 sticky top-14 sm:top-16 z-20 backdrop-blur-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 overflow-x-auto py-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
