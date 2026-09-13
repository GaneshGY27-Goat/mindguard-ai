import React, { useState } from 'react';
import { X, Smile, Check, Calendar } from 'lucide-react';
import { MoodEntry } from '../types';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMoodScore: number;
  onSaveMood: (score: number, label: string, notes?: string) => Promise<void>;
  recentMoods?: MoodEntry[];
}

const MOOD_OPTIONS: Array<{
  emoji: string;
  label: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  defaultScore: number;
  color: string;
}> = [
  { emoji: '😄', label: 'Very Good', defaultScore: 9, color: 'hover:border-emerald-500 hover:bg-emerald-500/10' },
  { emoji: '🙂', label: 'Good', defaultScore: 7, color: 'hover:border-teal-500 hover:bg-teal-500/10' },
  { emoji: '😐', label: 'Okay', defaultScore: 5, color: 'hover:border-amber-500 hover:bg-amber-500/10' },
  { emoji: '🙁', label: 'Low', defaultScore: 3, color: 'hover:border-orange-500 hover:bg-orange-500/10' },
  { emoji: '😟', label: 'Very Low', defaultScore: 2, color: 'hover:border-rose-500 hover:bg-rose-500/10' },
];

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  isOpen,
  onClose,
  currentMoodScore,
  onSaveMood,
  recentMoods = []
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>('Good');
  const [score, setScore] = useState<number>(currentMoodScore || 6);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectOption = (opt: typeof MOOD_OPTIONS[0]) => {
    setSelectedLabel(opt.label);
    setScore(opt.defaultScore);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveMood(score, selectedLabel, notes);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smile className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Subjective Wellness Check-in
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          How are you feeling today?
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Your subjective input pairs with objective biometric telemetry to refine stress risk estimation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 5 Emoji Options */}
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = selectedLabel === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 ring-2 ring-teal-400/30 scale-105'
                      : `bg-slate-900/60 border-slate-800 ${opt.color}`
                  }`}
                >
                  <span className="text-2xl sm:text-3xl select-none mb-1">{opt.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-300 leading-tight">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 1 - 10 Slider */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Detailed Calibration Score
              </span>
              <span className="text-base font-extrabold text-teal-400 font-mono">
                {score} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-1">
              <span>1 (Severe Distress)</span>
              <span>5 (Neutral)</span>
              <span>10 (Optimal)</span>
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Optional Context or Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Busy project deadline, got good sleep, relaxing evening..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || savedSuccess}
            className={`w-full py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 hover:opacity-95 shadow-lg shadow-teal-500/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Mood Entry Saved!</span>
              </>
            ) : (
              <span>{isSubmitting ? 'Saving...' : 'Record Daily Check-in'}</span>
            )}
          </button>
        </form>

        {/* Weekly Mood History Mini-Display */}
        {recentMoods.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Recent 7-Day Log</span>
            </div>
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1">
              {recentMoods.slice(0, 7).map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="flex flex-col items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800 min-w-[50px]"
                >
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-sm font-bold text-teal-300 font-mono my-0.5">
                    {m.score}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[45px]">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
