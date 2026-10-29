import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  Lock,
  HardDrive,
  EyeOff
} from 'lucide-react';
import {
  getMoodEntries,
  getBreathingSessions,
  clearAllLocalData,
  exportAllDataAsJson
} from '../services/storage';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCleared?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onDataCleared
}) => {
  const [entryCount, setEntryCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [clearedSuccess, setClearedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setEntryCount(getMoodEntries().length);
      setSessionCount(getBreathingSessions().length);
      setConfirmClear(false);
      setClearedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindguard_local_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    clearAllLocalData();
    setClearedSuccess(true);
    setEntryCount(0);
    setSessionCount(0);
    setConfirmClear(false);
    if (onDataCleared) onDataCleared();
    setTimeout(() => {
      setClearedSuccess(false);
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Privacy Modal"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 id="privacy-modal-title" className="text-xl font-bold text-white tracking-tight">
              Privacy & Local Data Management
            </h2>
            <p className="text-xs text-slate-400">
              Zero cloud tracking • Offline-first client architecture
            </p>
          </div>
        </div>

        {/* Notification Banner */}
        {clearedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>All local browser data has been completely erased.</span>
          </div>
        )}

        {/* 3 Privacy Pillars */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs">
            <HardDrive className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">100% In-Browser Storage</strong>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Your mood logs, stress check-ins, journal reflections, and breathing exercises are stored strictly in your browser's <code className="text-teal-300 font-mono">localStorage</code>. Data is not automatically synced across devices or browsers.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs">
            <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">No Cloud Telemetry Tracking</strong>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                MindGuard AI collects zero personal advertising cookies, does not require email signups for core features, and transmits no mental health data to third-party brokers.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Full User Ownership & Export</strong>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                You can download a complete JSON backup of your records or permanently delete all stored data from your device at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Current Storage Statistics */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Current Browser Storage
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Saved Mood Entries</span>
              <span className="text-lg font-bold text-white font-mono">{entryCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Breathing Sessions Completed</span>
              <span className="text-lg font-bold text-teal-400 font-mono">{sessionCount}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Banner for Deleting All Data */}
        {confirmClear && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <strong className="font-semibold">Confirm Permanent Erasure</strong>
            </div>
            <p className="text-[11px] text-rose-300 leading-relaxed">
              This will permanently delete all mood journal entries, breathing stats, and saved preferences from this browser. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
              >
                Yes, Erase All Data
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Data (JSON)</span>
          </button>

          {!confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={entryCount === 0 && sessionCount === 0}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
