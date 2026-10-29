import {
  SensorReading,
  RiskAnalysisResult,
  MoodEntry,
  TrendsData,
  StressRecord,
  TrustedContact,
  ChatMessage
} from '../types';


const API_BASE = '/api';

export async function fetchLatestData(): Promise<{
  reading: SensorReading;
  risk: RiskAnalysisResult;
}> {
  try {
    const res = await fetch(`${API_BASE}/sensor-data/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { reading: data.reading, risk: data.risk };
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackData();
  }
}

export async function sendSensorData(reading: Partial<SensorReading>): Promise<{
  reading: SensorReading;
  risk: RiskAnalysisResult;
}> {
  try {
    const res = await fetch(`${API_BASE}/sensor-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { reading: data.reading, risk: data.risk };
  } catch (err) {
    console.warn('Backend update failed, using client fallback', err);
    return calculateClientFallback(reading);
  }
}

export async function triggerHighStressScenario(): Promise<{
  reading: SensorReading;
  risk: RiskAnalysisResult;
}> {
  try {
    const res = await fetch(`${API_BASE}/simulation/high-stress`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { reading: data.reading, risk: data.risk };
  } catch (err) {
    return calculateClientFallback({
      heartRate: 105,
      spo2: 96,
      steps: 1850,
      sleepHours: 4.5,
      moodScore: 3,
      voiceStress: 'HIGH'
    });
  }
}

export async function triggerResetNormal(): Promise<{
  reading: SensorReading;
  risk: RiskAnalysisResult;
}> {
  try {
    const res = await fetch(`${API_BASE}/simulation/reset-normal`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { reading: data.reading, risk: data.risk };
  } catch (err) {
    return getFallbackData();
  }
}

import {
  getMoodEntries,
  saveMoodEntry,
  toLegacyMoodEntry,
  MoodJournalEntry
} from './storage';

export async function submitMoodEntry(entry: {
  score: number;
  label: string;
  emoji?: string;
  stressLevel?: number;
  notes?: string;
}): Promise<MoodEntry> {
  // Always persist locally to localStorage
  const savedLocal = saveMoodEntry({
    moodLabel: entry.label as any,
    moodEmoji: entry.emoji || '🙂',
    moodScore: entry.score,
    stressLevel: entry.stressLevel ?? (11 - Math.min(10, Math.max(1, entry.score))),
    notes: entry.notes
  });

  try {
    const res = await fetch(`${API_BASE}/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        ...data.entry,
        stressLevel: savedLocal.stressLevel,
        moodEmoji: savedLocal.moodEmoji
      };
    }
    return toLegacyMoodEntry(savedLocal);
  } catch (err) {
    return toLegacyMoodEntry(savedLocal);
  }
}

export async function fetchMoodHistory(): Promise<MoodEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/mood`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history) && data.history.length > 0) {
        return data.history;
      }
    }
    return getMoodEntries().map(toLegacyMoodEntry);
  } catch (err) {
    return getMoodEntries().map(toLegacyMoodEntry);
  }
}

export async function fetchTrends(timeframe: 'today' | '7days' | '30days'): Promise<TrendsData> {
  try {
    const res = await fetch(`${API_BASE}/stress/trends?timeframe=${timeframe}`);
    if (res.ok) {
      const data = await res.json();
      return data.trends;
    }
    return generateFallbackTrends(timeframe);
  } catch (err) {
    return generateFallbackTrends(timeframe);
  }
}


export async function sendChatMessage(message: string): Promise<ChatMessage> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.message;
  } catch (err) {
    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: "I hear you. While I cannot provide clinical medical advice, remember that pausing and taking slow, conscious breaths can help your body de-escalate stress. Would you like to try our 2-minute breathing exercise?",
      timestamp: new Date().toISOString(),
      quickActions: [
        { label: 'Start Guided Breathing', action: 'START_BREATHING' },
        { label: 'Log Mood', action: 'LOG_MOOD' }
      ]
    };
  }
}

export async function fetchContacts(): Promise<TrustedContact[]> {
  try {
    const res = await fetch(`${API_BASE}/contacts`);
    const data = await res.json();
    return data.contacts;
  } catch (err) {
    return [
      {
        id: 'tc_01',
        userId: 'usr_demo',
        name: 'Sarah Mercer (Mother)',
        phone: '+1 (555) 382-9912',
        relationship: 'Parent / Family',
        notifyOnHighRisk: true
      }
    ];
  }
}

export async function updateContact(contact: Partial<TrustedContact>): Promise<TrustedContact> {
  try {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    const data = await res.json();
    return data.contact;
  } catch (err) {
    return {
      id: 'tc_01',
      userId: 'usr_demo',
      name: contact.name || 'Sarah Mercer (Mother)',
      phone: contact.phone || '+1 (555) 382-9912',
      relationship: contact.relationship || 'Family',
      notifyOnHighRisk: contact.notifyOnHighRisk ?? true
    };
  }
}

export async function notifyTrustedDemo(): Promise<{
  recipient: string;
  phone: string;
  messagePreview: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/contacts/notify-demo`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return {
      recipient: 'Sarah Mercer (Mother)',
      phone: '+1 (555) 382-9912',
      messagePreview:
        '[MindGuard AI Notification] Alex has initiated a wellness check-in and may appreciate a supportive message or call. (Simulated Demo Message)'
    };
  }
}

// Fallback logic
function getFallbackData(): { reading: SensorReading; risk: RiskAnalysisResult } {
  return calculateClientFallback({
    heartRate: 72,
    spo2: 98,
    steps: 6420,
    sleepHours: 7.33,
    moodScore: 6,
    voiceStress: 'LOW'
  });
}

function calculateClientFallback(reading: Partial<SensorReading>): {
  reading: SensorReading;
  risk: RiskAnalysisResult;
} {
  const fullReading: SensorReading = {
    userId: 'usr_demo',
    timestamp: new Date().toISOString(),
    heartRate: reading.heartRate ?? 72,
    spo2: reading.spo2 ?? 98,
    steps: reading.steps ?? 6420,
    sleepHours: reading.sleepHours ?? 7.33,
    moodScore: reading.moodScore ?? 6,
    voiceStress: reading.voiceStress ?? 'LOW'
  };

  const hrNorm = fullReading.heartRate > 100 ? 90 : fullReading.heartRate > 84 ? 60 : fullReading.heartRate > 74 ? 35 : 10;
  const sleepNorm = fullReading.sleepHours < 5.0 ? 90 : fullReading.sleepHours < 6.5 ? 65 : fullReading.sleepHours < 7.5 ? 30 : 10;
  const moodNorm = Math.round(((10 - fullReading.moodScore) / 9) * 100);
  const actNorm = fullReading.steps < 2000 ? 85 : fullReading.steps < 5000 ? 55 : 20;
  const voiceNorm = fullReading.voiceStress === 'HIGH' ? 95 : fullReading.voiceStress === 'MEDIUM' ? 55 : 10;
  const spo2Norm = fullReading.spo2 < 95 ? 80 : fullReading.spo2 < 97 ? 30 : 5;

  const score = Math.round(
    hrNorm * 0.25 + sleepNorm * 0.20 + moodNorm * 0.20 + actNorm * 0.10 + voiceNorm * 0.20 + spo2Norm * 0.05
  );

  let riskLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'NORMAL';
  if (score > 80) riskLevel = 'VERY HIGH';
  else if (score > 60) riskLevel = 'HIGH';
  else if (score > 30) riskLevel = 'MODERATE';

  return {
    reading: fullReading,
    risk: {
      riskScore: score,
      riskLevel,
      calculatedAt: new Date().toISOString(),
      contributingFactors: [
        { id: 'heart_rate', name: 'Heart Rate Variation', weight: 0.25, normalizedScore: hrNorm, impactPercentage: 25, status: hrNorm > 70 ? 'high' : hrNorm > 40 ? 'moderate' : 'favorable', detail: `${fullReading.heartRate} BPM` },
        { id: 'sleep', name: 'Sleep Duration', weight: 0.20, normalizedScore: sleepNorm, impactPercentage: 20, status: sleepNorm > 70 ? 'high' : sleepNorm > 40 ? 'moderate' : 'favorable', detail: `${fullReading.sleepHours.toFixed(1)}h` },
        { id: 'mood', name: 'Self-Reported Mood', weight: 0.20, normalizedScore: moodNorm, impactPercentage: 20, status: moodNorm > 70 ? 'high' : moodNorm > 40 ? 'moderate' : 'favorable', detail: `${fullReading.moodScore}/10` },
        { id: 'voice_stress', name: 'Voice Stress Tone', weight: 0.20, normalizedScore: voiceNorm, impactPercentage: 20, status: voiceNorm > 70 ? 'high' : voiceNorm > 40 ? 'moderate' : 'favorable', detail: fullReading.voiceStress },
        { id: 'activity', name: 'Physical Movement', weight: 0.10, normalizedScore: actNorm, impactPercentage: 10, status: actNorm > 70 ? 'high' : actNorm > 40 ? 'moderate' : 'favorable', detail: `${fullReading.steps} steps` },
        { id: 'spo2', name: 'Oxygen Saturation', weight: 0.05, normalizedScore: spo2Norm, impactPercentage: 5, status: 'favorable', detail: `${fullReading.spo2}%` },
      ],
      aiSummary: riskLevel === 'NORMAL'
        ? 'Your current biometric and lifestyle indicators reflect stable, balanced baseline conditions.'
        : `Your current indicators suggest ${riskLevel.toLowerCase()} stress. Elevated heart rate and reduced sleep may be contributing.`,
      recommendations: riskLevel === 'NORMAL'
        ? ['Continue your normal routine', 'Stay hydrated', 'Maintain regular sleep schedule']
        : riskLevel === 'MODERATE'
        ? ['Try a 2-minute breathing exercise', 'Take a short 5-minute break', 'Consider a short walk', 'Check in with yourself']
        : ['Start guided 4-4-6 breathing', 'Move to a quiet environment', 'Contact someone you trust if you feel overwhelmed'],
      modelType: 'heuristic_weighted',
      disclaimer: 'Prototype Risk Model – Not a Medical Diagnostic Model.'
    }
  };
}

function generateFallbackTrends(timeframe: 'today' | '7days' | '30days'): TrendsData {
  const allEntries = getMoodEntries();
  const now = Date.now();
  const maxDays = timeframe === 'today' ? 1 : timeframe === '7days' ? 7 : 30;
  const cutoff = now - maxDays * 24 * 60 * 60 * 1000;

  // Filter entries within the timeframe and sort chronologically (oldest to newest)
  const filtered = allEntries
    .filter((e) => new Date(e.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (filtered.length === 0) {
    return {
      timeframe,
      records: [],
      summary: {
        avgStress: 0,
        avgSleep: 0,
        avgHeartRate: 0,
        avgMood: 0,
        totalObservations: 0,
        trendDirection: 'improving'
      },
      aiInsight: 'No check-in entries recorded for this period. Log your daily mood and stress to generate your personalized wellness history.'
    };
  }

  const records: StressRecord[] = filtered.map((e) => {
    // Map stress level 1-10 to risk score 0-100
    const riskScore = Math.round(e.stressLevel * 10);
    let riskLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'NORMAL';
    if (riskScore > 80) riskLevel = 'VERY HIGH';
    else if (riskScore > 60) riskLevel = 'HIGH';
    else if (riskScore > 30) riskLevel = 'MODERATE';

    return {
      id: e.id,
      userId: 'usr_local',
      timestamp: e.timestamp,
      riskScore,
      riskLevel,
      heartRate: 65 + Math.round((e.stressLevel / 10) * 25),
      spo2: 98,
      steps: 6400,
      sleepHours: 7.3,
      moodScore: e.moodScore,
      voiceStress: e.stressLevel >= 8 ? 'HIGH' : e.stressLevel >= 5 ? 'MEDIUM' : 'LOW'
    };
  });

  const avgStressVal = Number(
    (filtered.reduce((sum, e) => sum + e.stressLevel, 0) / filtered.length).toFixed(1)
  );
  const avgMoodVal = Number(
    (filtered.reduce((sum, e) => sum + e.moodScore, 0) / filtered.length).toFixed(1)
  );
  const avgRiskScore = Math.round(avgStressVal * 10);

  const firstEntry = filtered[0];
  const lastEntry = filtered[filtered.length - 1];
  const trendDirection =
    lastEntry.stressLevel < firstEntry.stressLevel
      ? 'improving'
      : lastEntry.stressLevel > firstEntry.stressLevel
      ? 'elevated'
      : 'improving';

  return {
    timeframe,
    records,
    summary: {
      avgStress: avgRiskScore,
      avgSleep: 7.3,
      avgHeartRate: 72,
      avgMood: avgMoodVal,
      totalObservations: filtered.length,
      trendDirection
    },
    aiInsight: `Based on your ${filtered.length} recorded check-in${filtered.length > 1 ? 's' : ''}, your average reported stress level is ${avgStressVal}/10 and your average mood score is ${avgMoodVal}/10. Continuous check-ins help identify personal wellness patterns.`
  };
}

