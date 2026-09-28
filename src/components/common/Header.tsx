import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateString, formatDateLabel } from '../../utils/fitnessCalculations';
import {
  Moon,
  Sun,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  Cloud,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { LogoutModal } from '../auth/LogoutModal';

export const Header: React.FC = () => {
  const { profile, selectedDate, setSelectedDate, toggleTheme, currentStreak, setActiveTab, isSyncing } = useFitness();
  const { currentUser, logOut } = useAuth();
  const today = getTodayDateString();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleGoToday = () => {
    setSelectedDate(today);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      setIsLogoutModalOpen(false);
      setIsDropdownOpen(false);
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isToday = selectedDate === today;

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs pt-safe transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Zone 1: Clean Brand Wordmark */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 sm:gap-1.5">
                FitTrack
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  PRO
                </span>
              </span>
            </div>
          </div>

          {/* Zone 2: Date Selector & Quick Navigation */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 sm:p-1 border border-slate-200 dark:border-slate-700/60 shadow-xs shrink-0">
            <button
              onClick={handlePrevDay}
              className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            
            <button
              onClick={handleGoToday}
              className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-medium rounded-lg flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                isToday
                  ? 'bg-white text-emerald-700 border border-emerald-200 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="tabular-nums truncate max-w-[70px] sm:max-w-none font-semibold">
                {isToday ? 'Today' : formatDateLabel(selectedDate)}
              </span>
            </button>

            <button
              onClick={handleNextDay}
              className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Zone 3: Sync status, Streak, Theme Toggle & Profile Dropdown */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Cloud Firestore Live Status */}
            <div
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-medium border ${
                isSyncing
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              }`}
              title="Synchronized with Cloud Firestore"
            >
              <Cloud className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSyncing ? 'animate-pulse text-cyan-600 dark:text-cyan-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Cloud'}</span>
            </div>

            {/* Active Streak counter */}
            <div 
              className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 text-[11px] sm:text-xs font-semibold tabular-nums"
              title={`${currentStreak} day goal streak!`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{currentStreak}d</span>
            </div>

            {/* Theme switch */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
              title={`Switch to ${profile.theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {profile.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 pl-0.5 sm:pl-1 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Account menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-xs text-slate-950 shadow-sm shrink-0">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : (currentUser?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile.name || 'FitTrack User'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser?.email || profile.email}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Goals</span>
                  </button>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer text-left mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};
