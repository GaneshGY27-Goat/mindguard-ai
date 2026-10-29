import { MoodEntry } from '../types';

export interface MoodJournalEntry {
  id: string;
  timestamp: string;
  moodLabel: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  moodEmoji: string;
  moodScore: number; // 1-10 (1 = Severe distress, 10 = Optimal)
  stressLevel: number; // 1-10 (1 = Relaxed, 10 = Extreme stress)
  notes?: string;
}

export interface BreathingSessionRecord {
  id: string;
  timestamp: string;
  durationSeconds: number;
  cyclesCompleted: number;
}

const STORAGE_KEYS = {
  MOOD_JOURNAL: 'mindguard_mood_journal_entries',
  BREATHING_SESSIONS: 'mindguard_breathing_sessions',
  SETTINGS: 'mindguard_user_settings'
};

/**
 * Safely parse JSON from localStorage with fallback
 */
function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed reading localStorage key "${key}":`, err);
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage
 */
function writeStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`Failed writing localStorage key "${key}":`, err);
    return false;
  }
}

// ============================================================================
// MOOD JOURNAL STORAGE
// ============================================================================

export function getMoodEntries(): MoodJournalEntry[] {
  const entries = readStorage<MoodJournalEntry[]>(STORAGE_KEYS.MOOD_JOURNAL, []);
  // Return sorted descending by timestamp (newest first)
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function saveMoodEntry(data: {
  moodLabel: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  moodEmoji: string;
  moodScore: number;
  stressLevel: number;
  notes?: string;
}): MoodJournalEntry {
  const entries = getMoodEntries();
  const newEntry: MoodJournalEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    moodLabel: data.moodLabel,
    moodEmoji: data.moodEmoji,
    moodScore: Math.min(10, Math.max(1, Math.round(data.moodScore))),
    stressLevel: Math.min(10, Math.max(1, Math.round(data.stressLevel))),
    notes: data.notes?.trim() ? data.notes.trim() : undefined
  };

  const updated = [newEntry, ...entries];
  writeStorage(STORAGE_KEYS.MOOD_JOURNAL, updated);
  return newEntry;
}

export function deleteMoodEntry(id: string): boolean {
  const entries = getMoodEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  writeStorage(STORAGE_KEYS.MOOD_JOURNAL, filtered);
  return true;
}

export function clearAllMoodEntries(): void {
  writeStorage(STORAGE_KEYS.MOOD_JOURNAL, []);
}

// Convert MoodJournalEntry to legacy MoodEntry format for backwards compatibility
export function toLegacyMoodEntry(entry: MoodJournalEntry): MoodEntry {
  return {
    id: entry.id,
    userId: 'usr_local',
    timestamp: entry.timestamp,
    score: entry.moodScore,
    label: entry.moodLabel,
    notes: entry.notes,
    stressLevel: entry.stressLevel
  };
}

// ============================================================================
// BREATHING SESSIONS STORAGE
// ============================================================================

export function getBreathingSessions(): BreathingSessionRecord[] {
  return readStorage<BreathingSessionRecord[]>(STORAGE_KEYS.BREATHING_SESSIONS, []);
}

export function recordBreathingSession(durationSeconds: number, cyclesCompleted: number): BreathingSessionRecord {
  const sessions = getBreathingSessions();
  const newSession: BreathingSessionRecord = {
    id: `breath_${Date.now()}`,
    timestamp: new Date().toISOString(),
    durationSeconds,
    cyclesCompleted
  };
  writeStorage(STORAGE_KEYS.BREATHING_SESSIONS, [newSession, ...sessions]);
  return newSession;
}

// ============================================================================
// DATA MANAGEMENT & PRIVACY
// ============================================================================

export function clearAllLocalData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEYS.MOOD_JOURNAL);
  window.localStorage.removeItem(STORAGE_KEYS.BREATHING_SESSIONS);
  window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

export function exportAllDataAsJson(): string {
  const payload = {
    appName: 'MindGuard AI Prototype',
    exportDate: new Date().toISOString(),
    privacyNotice: 'Exported from browser localStorage. No data is stored on remote servers.',
    moodJournal: getMoodEntries(),
    breathingSessions: getBreathingSessions()
  };
  return JSON.stringify(payload, null, 2);
}

export function getWeeklyMoodSummary(): {
  totalCheckIns: number;
  avgStress: number;
  avgMood: number;
  highestStressEntry: MoodJournalEntry | null;
  lowestStressEntry: MoodJournalEntry | null;
  summaryText: string;
} {
  const allEntries = getMoodEntries();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = allEntries.filter(
    (e) => new Date(e.timestamp).getTime() >= oneWeekAgo
  );

  if (recentEntries.length === 0) {
    return {
      totalCheckIns: 0,
      avgStress: 0,
      avgMood: 0,
      highestStressEntry: null,
      lowestStressEntry: null,
      summaryText: 'No check-ins have been recorded in the past 7 days. Log your daily mood and stress to see personalized trends.'
    };
  }

  const avgStress = Number(
    (recentEntries.reduce((sum, e) => sum + e.stressLevel, 0) / recentEntries.length).toFixed(1)
  );
  const avgMood = Number(
    (recentEntries.reduce((sum, e) => sum + e.moodScore, 0) / recentEntries.length).toFixed(1)
  );

  let highest = recentEntries[0];
  let lowest = recentEntries[0];
  recentEntries.forEach((e) => {
    if (e.stressLevel > highest.stressLevel) highest = e;
    if (e.stressLevel < lowest.stressLevel) lowest = e;
  });

  let tone = 'balanced and steady';
  if (avgStress >= 7) tone = 'notably elevated, suggesting sustained strain';
  else if (avgStress <= 3) tone = 'calm and restorative with low perceived tension';
  else tone = 'moderate and stable within manageable bounds';

  const summaryText = `Over the past 7 days, you completed ${recentEntries.length} check-in${recentEntries.length > 1 ? 's' : ''}. Your average stress rating was ${avgStress}/10 (${tone}), and your self-reported mood averaged ${avgMood}/10.`;

  return {
    totalCheckIns: recentEntries.length,
    avgStress,
    avgMood,
    highestStressEntry: highest,
    lowestStressEntry: lowest,
    summaryText
  };
}
