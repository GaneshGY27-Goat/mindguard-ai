export type VoiceStressLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'VERY HIGH';

export interface SensorReading {
  id?: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  spo2: number;
  steps: number;
  sleepHours: number;
  moodScore: number;
  voiceStress: VoiceStressLevel;
}

export interface ContributingFactor {
  id: string;
  name: string;
  weight: number;
  normalizedScore: number;
  impactPercentage: number;
  status: 'favorable' | 'mild' | 'moderate' | 'high';
  detail: string;
}

export interface RiskAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  calculatedAt: string;
  contributingFactors: ContributingFactor[];
  aiSummary: string;
  recommendations: string[];
  modelType: 'heuristic_weighted' | 'ml_predicted';
  disclaimer: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  timestamp: string;
  score: number;
  label: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  notes?: string;
  stressLevel?: number;
  moodEmoji?: string;
}


export interface StressRecord {
  id: string;
  userId: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  heartRate: number;
  spo2: number;
  steps: number;
  sleepHours: number;
  moodScore: number;
  voiceStress: VoiceStressLevel;
}

export interface TrendsData {
  timeframe: 'today' | '7days' | '30days';
  records: StressRecord[];
  summary: {
    avgStress: number;
    avgSleep: number;
    avgHeartRate: number;
    avgMood: number;
    totalObservations: number;
    trendDirection: 'improving' | 'elevated';
  };
  aiInsight: string;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnHighRisk: boolean;
  lastNotified?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: Array<{
    label: string;
    action: string;
  }>;
}
