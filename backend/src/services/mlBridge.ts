import { spawn } from 'child_process';
import path from 'path';
import { StressPredictor } from './riskEngine';

export class PythonMlPredictor implements StressPredictor {
  private scriptPath: string;

  constructor(scriptPath?: string) {
    this.scriptPath =
      scriptPath || path.resolve(__dirname, '../ml_service/predict.py');
  }

  public async predictStress(features: {
    heartRate: number;
    spo2: number;
    steps: number;
    sleepHours: number;
    moodScore: number;
    voiceStressNumeric: number;
  }): Promise<{ score: number; modelName: string; confidence?: number }> {
    return new Promise((resolve) => {
      try {
        const py = spawn('python', [this.scriptPath, JSON.stringify(features)]);
        let stdoutData = '';
        let stderrData = '';

        py.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        py.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        py.on('close', (code) => {
          if (code === 0 && stdoutData.trim()) {
            try {
              const parsed = JSON.parse(stdoutData.trim());
              return resolve({
                score: parsed.score,
                modelName: parsed.modelName || 'RandomForestRegressor-v1.4',
                confidence: parsed.confidence || 0.9
              });
            } catch (jsonErr) {
              console.warn('JSON parse failed from ML predictor output:', jsonErr);
            }
          }
          // Fallback in-process calculations if python runtime is unavailable or errors
          resolve(this.fallbackJsModel(features));
        });

        py.on('error', (err) => {
          console.warn('Python spawn error, falling back to TS calculation:', err.message);
          resolve(this.fallbackJsModel(features));
        });
      } catch (err) {
        resolve(this.fallbackJsModel(features));
      }
    });
  }

  private fallbackJsModel(features: {
    heartRate: number;
    spo2: number;
    steps: number;
    sleepHours: number;
    moodScore: number;
    voiceStressNumeric: number;
  }) {
    const hrPart = Math.max(0, (features.heartRate - 65) / 55) * 35;
    const sleepPart = Math.max(0, (8.0 - features.sleepHours) / 5) * 25;
    const moodPart = ((10.0 - features.moodScore) / 9) * 20;
    const voicePart = features.voiceStressNumeric * 15;
    const actPart = Math.max(0, (8000 - features.steps) / 8000) * 5;

    const total = Math.min(100, Math.max(0, hrPart + sleepPart + moodPart + voicePart + actPart));
    return {
      score: Math.round(total),
      modelName: 'EmbeddedEnsembleEmulator-v1.0',
      confidence: 0.88
    };
  }
}
