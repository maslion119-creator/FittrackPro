import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { StepTracker } from './components/steps/StepTracker';
import { DietTracker } from './components/diet/DietTracker';
import { WorkoutTracker } from './components/workouts/WorkoutTracker';
import { ProgressAnalytics } from './components/progress/ProgressAnalytics';
import { SettingsView } from './components/settings/SettingsView';
import { Activity, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, profile } = useFitness();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'steps':
        return <StepTracker />;
      case 'diet':
        return <DietTracker />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'progress':
        return <ProgressAnalytics />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950 overflow-x-hidden min-w-0 w-full transition-colors duration-200">
      {/* Top Bar Contract Header */}
      <Header />

      {/* Desktop navigation tabs & mobile bottom nav */}
      <BottomNav />

      {/* Main View Area with Mobile Safe Clearance */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-12 min-w-0">
        {renderActiveView()}
      </main>

      {/* Goal Celebration & Action Toast */}
      <Toast />

      {/* Onboarding Dialog if first time */}
      <OnboardingModal isOpen={!profile.isOnboarded} />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <Activity className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
              FitTrack <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">Cloud</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 dark:text-emerald-400" />
              Initializing secure session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <FitnessProvider>
      <MainAppContent />
    </FitnessProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
