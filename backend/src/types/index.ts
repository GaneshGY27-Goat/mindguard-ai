export type VoiceStressLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'VERY HIGH';

export interface SensorReading {
  id?: string;
  userId: string;
  timestamp: string;
  heartRate: number;    // BPM (e.g. 60 - 140)
  spo2: number;         // Percentage (e.g. 94 - 100)
  steps: number;        // Step count (e.g. 0 - 20000)
  sleepHours: number;   // Hours (e.g. 3.0 - 10.0)
  moodScore: number;    // 1 - 10
  voiceStress: VoiceStressLevel;
}

export interface RiskWeights {
  heartRate: number;    // default: 0.25
  sleep: number;        // default: 0.20
  mood: number;         // default: 0.20
  activity: number;     // default: 0.10
  voiceStress: number;  // default: 0.20
  spo2: number;         // default: 0.05
}

export interface ContributingFactor {
  id: string;
  name: string;
  weight: number;
  normalizedScore: number; // 0 (best) to 100 (worst)
  impactPercentage: number;
  status: 'favorable' | 'mild' | 'moderate' | 'high';
  detail: string;
}

export interface RiskAnalysisResult {
  riskScore: number;          // 0 - 100
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
  score: number; // 1 - 10
  label: 'Very Good' | 'Good' | 'Okay' | 'Low' | 'Very Low';
  notes?: string;
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

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnHighRisk: boolean;
  lastNotified?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  baselineHeartRate: number;
  targetSleep: number;
  targetSteps: number;
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
