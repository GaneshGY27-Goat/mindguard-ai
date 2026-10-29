import React, { useState, useEffect } from 'react';
import {
  X,
  Smile,
  Check,
  Calendar,
  Trash2,
  AlertCircle,
  Shield,
  BookOpen,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { MoodEntry } from '../types';
import {
  getMoodEntries,
  deleteMoodEntry,
  clearAllMoodEntries,
  MoodJournalEntry
} from '../services/storage';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMoodScore: number;
  onSaveMood: (score: number, label: string, notes?: string, emoji?: string, stressLevel?: number) => Promise<void>;
  recentMoods?: MoodEntry[];
}

const MOOD_OPTIONS: Array<{
  emoji: string;
  label: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  defaultScore: number;
  defaultStress: number;
  description: string;
  color: string;
  activeBorder: string;
}> = [
  {
    emoji: '😄',
    label: 'Very Good',
    defaultScore: 9,
    defaultStress: 2,
    description: 'Energetic, positive, and resilient',
    color: 'hover:border-emerald-500 hover:bg-emerald-500/10',
    activeBorder: 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30'
  },
  {
    emoji: '🙂',
    label: 'Good',
    defaultScore: 7,
    defaultStress: 3,
    description: 'Comfortable, calm, and balanced',
    color: 'hover:border-teal-500 hover:bg-teal-500/10',
    activeBorder: 'bg-teal-500/20 border-teal-400 ring-2 ring-teal-400/30'
  },
  {
    emoji: '😐',
    label: 'Okay',
    defaultScore: 5,
    defaultStress: 5,
    description: 'Neutral, getting through the day',
    color: 'hover:border-amber-500 hover:bg-amber-500/10',
    activeBorder: 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
  },
  {
    emoji: '🙁',
    label: 'Low',
    defaultScore: 3,
    defaultStress: 7,
    description: 'Strained, fatigued, or feeling down',
    color: 'hover:border-orange-500 hover:bg-orange-500/10',
    activeBorder: 'bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/30'
  },
  {
    emoji: '😟',
    label: 'Very Low',
    defaultScore: 2,
    defaultStress: 9,
    description: 'Significantly stressed or overwhelmed',
    color: 'hover:border-rose-500 hover:bg-rose-500/10',
    activeBorder: 'bg-rose-500/20 border-rose-400 ring-2 ring-rose-400/30'
  }
];

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  isOpen,
  onClose,
  currentMoodScore,
  onSaveMood
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0]>(MOOD_OPTIONS[1]);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [entries, setEntries] = useState<MoodJournalEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Load entries from localStorage whenever modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      loadStoredEntries();
    }
  }, [isOpen]);

  const loadStoredEntries = () => {
    const list = getMoodEntries();
    setEntries(list);
  };

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3000);
  };

  const handleSelectOption = (opt: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(opt);
    setStressLevel(opt.defaultStress);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stressLevel < 1 || stressLevel > 10) return;

    setIsSubmitting(true);
    try {
      await onSaveMood(
        selectedMood.defaultScore,
        selectedMood.label,
        notes,
        selectedMood.emoji,
        stressLevel
      );
      setSavedSuccess(true);
      showNotification('Mood check-in successfully saved to localStorage!');
      loadStoredEntries();

      // Reset form fields
      setNotes('');
      setTimeout(() => {
        setSavedSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to save mood entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    deleteMoodEntry(id);
    setConfirmDeleteId(null);
    loadStoredEntries();
    showNotification('Journal entry deleted.');
  };

  const handleClearAll = () => {
    clearAllMoodEntries();
    setConfirmClearAll(false);
    loadStoredEntries();
    showNotification('All saved journal entries cleared from localStorage.');
  };

  const getStressDescription = (lvl: number) => {
    if (lvl <= 2) return 'Level ' + lvl + ' – Relaxed & Tranquil: Minimal bodily or emotional tension.';
    if (lvl <= 4) return 'Level ' + lvl + ' – Mild Stress: Normal daily alertness and manageable demands.';
    if (lvl <= 6) return 'Level ' + lvl + ' – Moderate Tension: Noticeable mental pressure or physical fatigue.';
    if (lvl <= 8) return 'Level ' + lvl + ' – High Stress: Elevated pulse, sustained strain, pause recommended.';
    return 'Level ' + lvl + ' – Severe Distress: Overwhelmed, consider breathing exercise or reaching out.';
  };

  const getStressColorBadge = (lvl: number) => {
    if (lvl <= 3) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (lvl <= 6) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (lvl <= 8) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-5 sm:p-7 border border-slate-700 shadow-2xl my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Mood Journal"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smile className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Mood Journal & Self-Reflection
          </span>
        </div>

        <h2 id="mood-modal-title" className="text-2xl font-bold text-white tracking-tight">
          How are you feeling today?
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Log your subjective mood and stress level. Entries are stored privately in your browser's local storage.
        </p>

        {/* Success/Action Notification Banner */}
        {notificationMsg && (
          <div
            role="status"
            className="mt-3 p-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in"
          >
            <Check className="w-4 h-4 shrink-0 text-teal-400" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Tab Switcher: New Check-In vs History */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'new'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Check-in</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Saved Entries ({entries.length})</span>
          </button>
        </div>

        {activeTab === 'new' ? (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* 1. Emoji Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Current Mood
              </label>
              <div
                role="radiogroup"
                aria-label="Mood selection"
                className="grid grid-cols-5 gap-2"
              >
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = selectedMood.label === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${opt.label}: ${opt.description}`}
                      onClick={() => handleSelectOption(opt)}
                      className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        isSelected
                          ? opt.activeBorder + ' scale-105'
                          : `bg-slate-900/70 border-slate-800 ${opt.color}`
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl select-none mb-1">{opt.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-200 leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-teal-300/90 mt-2 font-medium">
                Selected: <strong>{selectedMood.emoji} {selectedMood.label}</strong> — {selectedMood.description}
              </p>
            </div>

            {/* 2. Stress Level Selector (1 to 10) */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="stress-slider" className="text-xs font-semibold text-slate-200 block">
                    2. Perceived Stress Level (1 to 10)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    From deep relaxation (1) to intense strain (10)
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStressColorBadge(
                    stressLevel
                  )}`}
                >
                  Stress: {stressLevel} / 10
                </span>
              </div>

              {/* Numbered Quick Buttons */}
              <div className="grid grid-cols-10 gap-1 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStressLevel(num)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition focus:outline-none focus:ring-1 focus:ring-teal-400 ${
                      stressLevel === num
                        ? 'bg-teal-400 text-slate-950 font-black shadow-md scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Slider for precision */}
              <input
                id="stress-slider"
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none mt-1"
                aria-label="Stress Level 1 to 10"
              />

              <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
                {getStressDescription(stressLevel)}
              </div>
            </div>

            {/* 3. Optional Short Journal Entry */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="journal-notes" className="text-xs font-semibold text-slate-300">
                  3. Optional Short Reflection / Notes
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {notes.length} / 280
                </span>
              </div>
              <textarea
                id="journal-notes"
                maxLength={280}
                rows={3}
                placeholder="Write a brief reflection on your thoughts, context, or triggers today (e.g. good sleep, busy deadline, relaxing evening walk)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition resize-none"
              />
            </div>

            {/* Privacy Note */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                <strong>Local Storage Notice:</strong> Saved entries stay strictly in your browser. No data leaves your device.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || savedSuccess}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                savedSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 hover:opacity-95 shadow-lg shadow-teal-500/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Entry Recorded & Saved to Local Storage!</span>
                </>
              ) : (
                <span>{isSubmitting ? 'Saving to Local Storage...' : 'Save Check-in Entry'}</span>
              )}
            </button>
          </form>
        ) : (
          /* SAVED ENTRIES / HISTORY VIEW */
          <div className="mt-5 space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {/* Header / Clear Actions */}
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-slate-400 font-medium">
                Total Saved: <strong className="text-white">{entries.length}</strong>
              </span>

              {entries.length > 0 && !confirmClearAll && (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Data</span>
                </button>
              )}
            </div>

            {/* Clear All Confirmation Banner */}
            {confirmClearAll && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Are you sure you want to permanently delete all journal entries?</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Entries List or Empty State */}
            {entries.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Journal Entries Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You haven't recorded any check-in reflections yet. Switch back to "New Check-in" to log your current state.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                >
                  Log Your First Entry &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {entries.map((entry) => {
                  const dateObj = new Date(entry.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  const isConfirming = confirmDeleteId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl select-none">{entry.moodEmoji || '🙂'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {entry.moodLabel}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStressColorBadge(
                                  entry.stressLevel
                                )}`}
                              >
                                Stress: {entry.stressLevel}/10
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {formattedDate} • {formattedTime}
                            </span>
                          </div>
                        </div>

                        {/* Individual Delete Action */}
                        {!isConfirming ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            aria-label={`Delete entry from ${formattedDate}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 italic leading-relaxed">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
