import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shadow-xs">
          <LogOut className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Confirm Sign Out</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Are you sure you want to end your session? Your fitness history, logs, and targets are safely stored in your Cloud Firestore database.
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            {isLoggingOut ? 'Signing Out...' : 'Yes, Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
