import {
  SensorReading,
  RiskAnalysisResult,
  MoodEntry,
  TrendsData,
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

export async function submitMoodEntry(entry: {
  score: number;
  label: string;
  notes?: string;
}): Promise<MoodEntry> {
  try {
    const res = await fetch(`${API_BASE}/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    return data.entry;
  } catch (err) {
    return {
      id: `mood_${Date.now()}`,
      userId: 'usr_demo',
      timestamp: new Date().toISOString(),
      score: entry.score,
      label: entry.label as any,
      notes: entry.notes
    };
  }
}

export async function fetchMoodHistory(): Promise<MoodEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/mood`);
    const data = await res.json();
    return data.history;
  } catch (err) {
    return [];
  }
}

export async function fetchTrends(timeframe: 'today' | '7days' | '30days'): Promise<TrendsData> {
  try {
    const res = await fetch(`${API_BASE}/stress/trends?timeframe=${timeframe}`);
    const data = await res.json();
    return data.trends;
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
  const count = timeframe === 'today' ? 8 : timeframe === '7days' ? 7 : 30;
  const records: any[] = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * (timeframe === 'today' ? 2 * 3600 * 1000 : 24 * 3600 * 1000));
    records.push({
      id: `str_${i}`,
      timestamp: time.toISOString(),
      riskScore: 25 + Math.round(Math.sin(i * 0.7) * 15),
      heartRate: 70 + Math.round(Math.cos(i * 0.5) * 8),
      sleepHours: 7.2 + Math.sin(i * 0.4) * 0.8,
      moodScore: 7 + Math.round(Math.cos(i * 0.6) * 1.5),
      steps: 6200 + Math.round(Math.sin(i) * 2000)
    });
  }
  return {
    timeframe,
    records,
    summary: {
      avgStress: 38,
      avgSleep: 7.3,
      avgHeartRate: 72,
      avgMood: 6.8,
      totalObservations: count,
      trendDirection: 'improving'
    },
    aiInsight: 'Your average stress score has decreased over the last 7 days. Regular sleep patterns and consistent daily steps appear to be associated with lower stress scores in this prototype dataset.'
  };
}
