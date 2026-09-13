import {
  SensorReading,
  RiskWeights,
  RiskAnalysisResult,
  RiskLevel,
  ContributingFactor,
  VoiceStressLevel
} from '../types';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  heartRate: 0.25,   // 25%
  sleep: 0.20,       // 20%
  mood: 0.20,        // 20%
  activity: 0.10,    // 10%
  voiceStress: 0.20, // 20%
  spo2: 0.05         // 5%
};

export const PROTOTYPE_DISCLAIMER =
  'Prototype Risk Model – Not a Medical Diagnostic Model. Estimates stress/mental-wellness risk based on available proxy signals and provides non-medical supportive recommendations.';

export interface RiskEngineOptions {
  weights?: Partial<RiskWeights>;
  useMlPredictor?: boolean;
}

/**
 * Standard interface for future ML model integration (Random Forest / XGBoost / LSTM)
 */
export interface StressPredictor {
  predictStress(features: {
    heartRate: number;
    spo2: number;
    steps: number;
    sleepHours: number;
    moodScore: number;
    voiceStressNumeric: number; // 0 for Low, 0.5 for Med, 1.0 for High
  }): Promise<{ score: number; modelName: string; confidence?: number }>;
}

export class RiskEngine {
  private weights: RiskWeights;
  private customPredictor?: StressPredictor;

  constructor(weights: Partial<RiskWeights> = {}, predictor?: StressPredictor) {
    this.weights = { ...DEFAULT_RISK_WEIGHTS, ...weights };
    this.customPredictor = predictor;
  }

  public setWeights(newWeights: Partial<RiskWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): RiskWeights {
    return { ...this.weights };
  }

  public setPredictor(predictor: StressPredictor): void {
    this.customPredictor = predictor;
  }

  /**
   * Main calculation entrypoint
   */
  public async analyze(
    reading: Omit<SensorReading, 'id' | 'userId' | 'timestamp'>,
    options: RiskEngineOptions = {}
  ): Promise<RiskAnalysisResult> {
    const activeWeights: RiskWeights = {
      ...this.weights,
      ...(options.weights || {})
    };

    // Normalize weights to sum to 1.0
    const totalWeight =
      activeWeights.heartRate +
      activeWeights.sleep +
      activeWeights.mood +
      activeWeights.activity +
      activeWeights.voiceStress +
      activeWeights.spo2;

    const normalizedWeights: RiskWeights = {
      heartRate: activeWeights.heartRate / totalWeight,
      sleep: activeWeights.sleep / totalWeight,
      mood: activeWeights.mood / totalWeight,
      activity: activeWeights.activity / totalWeight,
      voiceStress: activeWeights.voiceStress / totalWeight,
      spo2: activeWeights.spo2 / totalWeight
    };

    // Calculate individual factor stress scores (0 = optimal/calm, 100 = elevated stress)
    const hrFactor = this.normalizeHeartRate(reading.heartRate);
    const sleepFactor = this.normalizeSleep(reading.sleepHours);
    const moodFactor = this.normalizeMood(reading.moodScore);
    const activityFactor = this.normalizeActivity(reading.steps);
    const voiceFactor = this.normalizeVoiceStress(reading.voiceStress);
    const spo2Factor = this.normalizeSpo2(reading.spo2);

    let calculatedScore = 0;
    let modelType: 'heuristic_weighted' | 'ml_predicted' = 'heuristic_weighted';

    // If a custom ML predictor is active and requested
    if (options.useMlPredictor && this.customPredictor) {
      try {
        const voiceNumeric =
          reading.voiceStress === 'HIGH' ? 1.0 : reading.voiceStress === 'MEDIUM' ? 0.5 : 0.0;
        const mlResult = await this.customPredictor.predictStress({
          heartRate: reading.heartRate,
          spo2: reading.spo2,
          steps: reading.steps,
          sleepHours: reading.sleepHours,
          moodScore: reading.moodScore,
          voiceStressNumeric: voiceNumeric
        });
        calculatedScore = Math.round(Math.min(100, Math.max(0, mlResult.score)));
        modelType = 'ml_predicted';
      } catch (err) {
        console.warn('ML predictor fallback to heuristic model:', err);
      }
    }

    if (modelType === 'heuristic_weighted') {
      const rawScore =
        hrFactor.score * normalizedWeights.heartRate +
        sleepFactor.score * normalizedWeights.sleep +
        moodFactor.score * normalizedWeights.mood +
        activityFactor.score * normalizedWeights.activity +
        voiceFactor.score * normalizedWeights.voiceStress +
        spo2Factor.score * normalizedWeights.spo2;

      calculatedScore = Math.round(Math.min(100, Math.max(0, rawScore)));
    }

    const riskLevel = this.classifyRiskLevel(calculatedScore);

    // Build contributing factors breakdown
    const contributingFactors: ContributingFactor[] = [
      {
        id: 'heart_rate',
        name: 'Heart Rate Variation',
        weight: normalizedWeights.heartRate,
        normalizedScore: Math.round(hrFactor.score),
        impactPercentage: Math.round((hrFactor.score * normalizedWeights.heartRate) / (calculatedScore || 1) * 100),
        status: hrFactor.status,
        detail: hrFactor.detail
      },
      {
        id: 'sleep',
        name: 'Sleep Duration & Rest',
        weight: normalizedWeights.sleep,
        normalizedScore: Math.round(sleepFactor.score),
        impactPercentage: Math.round((sleepFactor.score * normalizedWeights.sleep) / (calculatedScore || 1) * 100),
        status: sleepFactor.status,
        detail: sleepFactor.detail
      },
      {
        id: 'mood',
        name: 'Self-Reported Mood',
        weight: normalizedWeights.mood,
        normalizedScore: Math.round(moodFactor.score),
        impactPercentage: Math.round((moodFactor.score * normalizedWeights.mood) / (calculatedScore || 1) * 100),
        status: moodFactor.status,
        detail: moodFactor.detail
      },
      {
        id: 'voice_stress',
        name: 'Voice Stress Tone',
        weight: normalizedWeights.voiceStress,
        normalizedScore: Math.round(voiceFactor.score),
        impactPercentage: Math.round((voiceFactor.score * normalizedWeights.voiceStress) / (calculatedScore || 1) * 100),
        status: voiceFactor.status,
        detail: voiceFactor.detail
      },
      {
        id: 'activity',
        name: 'Physical Movement',
        weight: normalizedWeights.activity,
        normalizedScore: Math.round(activityFactor.score),
        impactPercentage: Math.round((activityFactor.score * normalizedWeights.activity) / (calculatedScore || 1) * 100),
        status: activityFactor.status,
        detail: activityFactor.detail
      },
      {
        id: 'spo2',
        name: 'Blood Oxygen (SpO₂)',
        weight: normalizedWeights.spo2,
        normalizedScore: Math.round(spo2Factor.score),
        impactPercentage: Math.round((spo2Factor.score * normalizedWeights.spo2) / (calculatedScore || 1) * 100),
        status: spo2Factor.status,
        detail: spo2Factor.detail
      }
    ].sort((a, b) => b.normalizedScore - a.normalizedScore);

    const aiSummary = this.generateAiExplanation(riskLevel, contributingFactors, reading);
    const recommendations = this.generateRecommendations(riskLevel);

    return {
      riskScore: calculatedScore,
      riskLevel,
      calculatedAt: new Date().toISOString(),
      contributingFactors,
      aiSummary,
      recommendations,
      modelType,
      disclaimer: PROTOTYPE_DISCLAIMER
    };
  }

  public classifyRiskLevel(score: number): RiskLevel {
    if (score <= 30) return 'NORMAL';
    if (score <= 60) return 'MODERATE';
    if (score <= 80) return 'HIGH';
    return 'VERY HIGH';
  }

  private normalizeHeartRate(bpm: number): { score: number; status: ContributingFactor['status']; detail: string } {
    if (bpm <= 72) {
      return { score: 10, status: 'favorable', detail: `${bpm} BPM (Calm, resting baseline)` };
    }
    if (bpm <= 84) {
      return { score: 35, status: 'mild', detail: `${bpm} BPM (Mildly elevated above baseline)` };
    }
    if (bpm <= 98) {
      return { score: 65, status: 'moderate', detail: `${bpm} BPM (Elevated autonomic arousal)` };
    }
    return { score: 95, status: 'high', detail: `${bpm} BPM (Significantly elevated heart rate)` };
  }

  private normalizeSleep(hours: number): { score: number; status: ContributingFactor['status']; detail: string } {
    if (hours >= 7.5) {
      return { score: 10, status: 'favorable', detail: `${hours.toFixed(1)}h (Restorative sleep duration)` };
    }
    if (hours >= 6.5) {
      return { score: 30, status: 'mild', detail: `${hours.toFixed(1)}h (Acceptable sleep duration)` };
    }
    if (hours >= 5.0) {
      return { score: 65, status: 'moderate', detail: `${hours.toFixed(1)}h (Restricted sleep; elevated fatigue risk)` };
    }
    return { score: 95, status: 'high', detail: `${hours.toFixed(1)}h (Critical sleep deficit observed)` };
  }

  private normalizeMood(score: number): { score: number; status: ContributingFactor['status']; detail: string } {
    // 1 to 10 scale, where 10 is very good and 1 is very low
    const clamped = Math.max(1, Math.min(10, score));
    const inverted = (10 - clamped) / 9 * 100;

    if (clamped >= 7) {
      return { score: Math.round(inverted), status: 'favorable', detail: `Self-rating ${clamped}/10 (Positive subjective mood)` };
    }
    if (clamped >= 5) {
      return { score: Math.round(inverted), status: 'mild', detail: `Self-rating ${clamped}/10 (Neutral/mild stress subjective mood)` };
    }
    if (clamped >= 3) {
      return { score: Math.round(inverted), status: 'moderate', detail: `Self-rating ${clamped}/10 (Subdued or low mood state)` };
    }
    return { score: Math.round(inverted), status: 'high', detail: `Self-rating ${clamped}/10 (Significant subjective distress noted)` };
  }

  private normalizeActivity(steps: number): { score: number; status: ContributingFactor['status']; detail: string } {
    if (steps >= 7500) {
      return { score: 10, status: 'favorable', detail: `${steps.toLocaleString()} steps (Healthy movement helps buffer stress)` };
    }
    if (steps >= 4500) {
      return { score: 35, status: 'mild', detail: `${steps.toLocaleString()} steps (Moderate activity recorded)` };
    }
    if (steps >= 2000) {
      return { score: 65, status: 'moderate', detail: `${steps.toLocaleString()} steps (Low physical movement)` };
    }
    return { score: 90, status: 'high', detail: `${steps.toLocaleString()} steps (Sedentary state during observation window)` };
  }

  private normalizeVoiceStress(level: VoiceStressLevel): { score: number; status: ContributingFactor['status']; detail: string } {
    if (level === 'LOW') {
      return { score: 10, status: 'favorable', detail: 'Low voice tension and stable pitch cadence' };
    }
    if (level === 'MEDIUM') {
      return { score: 55, status: 'moderate', detail: 'Moderate pitch jitter and rapid vocal onset indicators' };
    }
    return { score: 95, status: 'high', detail: 'High vocal tension and acute acoustic stress markers' };
  }

  private normalizeSpo2(spo2: number): { score: number; status: ContributingFactor['status']; detail: string } {
    if (spo2 >= 97) {
      return { score: 5, status: 'favorable', detail: `${spo2}% SpO₂ (Optimal oxygen saturation)` };
    }
    if (spo2 >= 95) {
      return { score: 30, status: 'mild', detail: `${spo2}% SpO₂ (Normal range)` };
    }
    return { score: 85, status: 'high', detail: `${spo2}% SpO₂ (Sub-optimal oxygen saturation)` };
  }

  private generateAiExplanation(
    level: RiskLevel,
    factors: ContributingFactor[],
    reading: Omit<SensorReading, 'id' | 'userId' | 'timestamp'>
  ): string {
    const elevated = factors.filter((f) => f.status === 'high' || f.status === 'moderate');

    if (level === 'NORMAL') {
      return 'Your current biometric and lifestyle indicators reflect stable, balanced baseline conditions. Restful recovery and healthy vitals are supporting your resilience today.';
    }

    if (level === 'MODERATE') {
      if (elevated.length > 0) {
        const topReasons = elevated.slice(0, 2).map((f) => f.name.toLowerCase()).join(' and ');
        return `Your current indicators suggest moderate stress. Indicators such as ${topReasons} compared with your baseline may be contributing.`;
      }
      return 'Your physiological signals show mild autonomic strain. Taking a brief mindful pause can help reset your balance.';
    }

    if (level === 'HIGH') {
      const topReasons = elevated.slice(0, 2).map((f) => f.name.toLowerCase()).join(' alongside ');
      return `Elevated stress indicators detected. Elevated ${topReasons || 'autonomic arousal'} are driving this score. A short break or breathing session is recommended.`;
    }

    // VERY HIGH
    return 'Significant cumulative stress markers identified across multiple biometric and self-reported channels. We strongly recommend stepping away from demanding tasks, trying guided breathing, or connecting with someone you trust.';
  }

  private generateRecommendations(level: RiskLevel): string[] {
    switch (level) {
      case 'NORMAL':
        return [
          'Continue your normal daily routine and maintain balance',
          'Stay hydrated throughout the day with regular water intake',
          'Maintain regular sleep schedule for tonight (target 7–8 hours)',
          'Take brief posture and stretch breaks if working seated'
        ];
      case 'MODERATE':
        return [
          'Try a 2-minute 4-4-6 guided breathing exercise to reset autonomic tone',
          'Take a short 5-minute break away from screens and bright displays',
          'Consider a short gentle walk or light physical movement',
          'Check in with yourself and jot down any immediate stressors'
        ];
      case 'HIGH':
        return [
          'Start guided 4-4-6 paced breathing to activate your parasympathetic nervous system',
          'Move to a quiet, dimly lit, or lower-stimulation environment',
          'Sip warm water or caffeine-free herbal tea',
          'Contact someone you trust or a close friend if you feel overwhelmed'
        ];
      case 'VERY HIGH':
        return [
          'Pause current activities and focus on slow, gentle breathing right now',
          'Reach out to your designated trusted contact via the quick action below',
          'Step into a calm, safe environment with fresh air or quiet surroundings',
          'Remember: You are not alone. Reach out to supportive peer or professional wellness resources anytime.'
        ];
    }
  }
}

// Singleton export
export const defaultRiskEngine = new RiskEngine();
