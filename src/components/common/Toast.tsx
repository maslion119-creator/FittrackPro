import React, { useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CheckCircle2, Trophy, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useFitness();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const isCelebration = toast.type === 'celebration';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full transition-all duration-300 transform translate-y-0 opacity-100">
      <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-md border flex items-start gap-3 ${
        isCelebration
          ? 'bg-slate-900/95 border-emerald-500/40 text-white shadow-emerald-500/10'
          : isInfo
          ? 'bg-slate-900/95 border-sky-500/30 text-white'
          : 'bg-slate-900/95 border-slate-700 text-white'
      }`}>
        <div className="mt-0.5 shrink-0">
          {isCelebration ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-4 h-4 fill-emerald-400/20 text-emerald-400 animate-bounce" />
            </div>
          ) : isInfo ? (
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Info className="w-4 h-4 text-sky-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-semibold tracking-tight text-white">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>

        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
