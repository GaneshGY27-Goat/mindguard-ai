import { Router, Request, Response } from 'express';
import { db } from '../store/database';
import { defaultRiskEngine } from '../services/riskEngine';
import { PythonMlPredictor } from '../services/mlBridge';

const router = Router();
const mlPredictor = new PythonMlPredictor();
defaultRiskEngine.setPredictor(mlPredictor);

/**
 * 1. GET /api/sensor-data/latest
 * Returns latest vitals reading and real-time risk assessment
 */
router.get('/sensor-data/latest', async (req: Request, res: Response) => {
  try {
    const reading = db.getLatestSensorReading();
    const risk = await defaultRiskEngine.analyze(reading);
    return res.json({
      success: true,
      reading,
      risk
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. POST /api/sensor-data
 * Ingests live or simulated wearable data
 */
router.post('/sensor-data', async (req: Request, res: Response) => {
  try {
    const { heartRate, spo2, steps, sleepHours, moodScore, voiceStress } = req.body;

    if (
      heartRate === undefined ||
      spo2 === undefined ||
      steps === undefined ||
      sleepHours === undefined ||
      moodScore === undefined ||
      voiceStress === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required sensor telemetry fields'
      });
    }

    const updated = db.updateLatestSensorReading({
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      steps: Number(steps),
      sleepHours: Number(sleepHours),
      moodScore: Number(moodScore),
      voiceStress: voiceStress
    });

    const risk = await defaultRiskEngine.analyze(updated);

    // Record into stress history
    db.recordStressAssessment({
      timestamp: updated.timestamp,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      heartRate: updated.heartRate,
      spo2: updated.spo2,
      steps: updated.steps,
      sleepHours: updated.sleepHours,
      moodScore: updated.moodScore,
      voiceStress: updated.voiceStress
    });

    return res.json({
      success: true,
      message: 'Telemetry updated successfully',
      reading: updated,
      risk
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. POST /api/risk-analysis
 * Pure calculation endpoint
 */
router.post('/risk-analysis', async (req: Request, res: Response) => {
  try {
    const { features, weights, useMlPredictor } = req.body;
    if (!features) {
      return res.status(400).json({ success: false, error: 'Features object required' });
    }

    const result = await defaultRiskEngine.analyze(features, {
      weights,
      useMlPredictor: Boolean(useMlPredictor)
    });

    return res.json({
      success: true,
      result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. POST /api/mood & GET /api/mood
 */
router.post('/mood', (req: Request, res: Response) => {
  try {
    const { score, label, notes } = req.body;
    if (score === undefined || !label) {
      return res.status(400).json({ success: false, error: 'score and label are required' });
    }

    const entry = db.addMoodEntry({
      score: Number(score),
      label,
      notes
    });

    return res.json({
      success: true,
      entry
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/mood', (req: Request, res: Response) => {
  const history = db.getMoodHistory(14);
  return res.json({ success: true, history });
});

/**
 * 5. GET /api/stress/trends
 */
router.get('/stress/trends', (req: Request, res: Response) => {
  const timeframe = (req.query.timeframe as 'today' | '7days' | '30days') || '7days';
  const trends = db.getTrends(timeframe);
  return res.json({ success: true, trends });
});

/**
 * 6. GET /api/recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const reading = db.getLatestSensorReading();
    const risk = await defaultRiskEngine.analyze(reading);
    return res.json({
      success: true,
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      recommendations: risk.recommendations,
      disclaimer: risk.disclaimer
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. POST /api/chat (MindGuard AI Assistant)
 */
router.post('/chat', (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const lower = message.toLowerCase();
    let reply = '';
    const quickActions: Array<{ label: string; action: string }> = [];

    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('panic') || lower.includes('overwhelm')) {
      reply =
        "It sounds like you're feeling elevated stress or pressure right now. Remember to be gentle with yourself. While I cannot provide clinical medical advice, guided 4-4-6 breathing can help stimulate your body's relaxation response. Would you like to start a short 2-minute breathing cycle?";
      quickActions.push(
        { label: 'Start Guided Breathing', action: 'START_BREATHING' },
        { label: 'Log My Current Mood', action: 'LOG_MOOD' },
        { label: 'Notify Trusted Contact', action: 'CONTACT_TRUSTED' }
      );
    } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('rest')) {
      reply =
        'Restorative sleep is one of our primary natural stress buffers. In your prototype dataset, days with over 7.5 hours of sleep correlated with lower stress scores. Maintaining a dark room and avoiding screens 30 minutes before bed can support recovery.';
      quickActions.push(
        { label: 'View Sleep Trends', action: 'VIEW_TRENDS' },
        { label: 'Breathing for Sleep', action: 'START_BREATHING' }
      );
    } else if (lower.includes('heart') || lower.includes('bpm') || lower.includes('pulse')) {
      reply =
        'Your heart rate variability and resting rate are key indicators in autonomic arousal estimation. A temporary spike is normal during activity or focus, but sustained elevation without exertion often indicates physical or mental tension.';
      quickActions.push(
        { label: 'Check Live Vitals', action: 'VIEW_VITALS' },
        { label: 'Start 2-Min Reset', action: 'START_BREATHING' }
      );
    } else if (lower.includes('score') || lower.includes('risk') || lower.includes('how am i')) {
      const reading = db.getLatestSensorReading();
      reply = `Your current estimated Stress Risk is calculated based on multi-signal indicators (Heart rate: ${reading.heartRate} BPM, Sleep: ${reading.sleepHours.toFixed(1)}h, Mood: ${reading.moodScore}/10, Voice: ${reading.voiceStress}). This is a non-diagnostic prototype score to encourage self-awareness.`;
      quickActions.push(
        { label: 'Explore Trends', action: 'VIEW_TRENDS' },
        { label: 'Log Mood', action: 'LOG_MOOD' }
      );
    } else {
      reply =
        "I'm here to support your daily wellness journey. I can guide you through paced breathing, help you track your mood trends, or review your multi-signal vitals. What would feel most helpful right now?";
      quickActions.push(
        { label: 'Breathing Exercise', action: 'START_BREATHING' },
        { label: 'Log Mood', action: 'LOG_MOOD' },
        { label: 'View Trends', action: 'VIEW_TRENDS' }
      );
    }

    return res.json({
      success: true,
      message: {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toISOString(),
        quickActions
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. GET & POST /api/contacts & /api/contacts/notify-demo
 */
router.get('/contacts', (req: Request, res: Response) => {
  return res.json({ success: true, contacts: db.getContacts() });
});

router.post('/contacts', (req: Request, res: Response) => {
  try {
    const updated = db.updateContact(req.body);
    return res.json({ success: true, contact: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/contacts/notify-demo', (req: Request, res: Response) => {
  const contacts = db.getContacts();
  const primary = contacts[0] || { name: 'Trusted Contact', phone: '+1 (555) 019-2831' };
  return res.json({
    success: true,
    simulatedDelivery: true,
    recipient: primary.name,
    phone: primary.phone,
    timestamp: new Date().toISOString(),
    messagePreview: `[MindGuard AI Notification] Alex has initiated a wellness check-in and may appreciate a supportive message or call. (Simulated Demo Message)`
  });
});

/**
 * 9. Preset Simulation Shortcuts
 */
router.post('/simulation/high-stress', async (req: Request, res: Response) => {
  const updated = db.updateLatestSensorReading({
    heartRate: 105,
    spo2: 96,
    steps: 1850,
    sleepHours: 4.5,
    moodScore: 3,
    voiceStress: 'HIGH'
  });

  const risk = await defaultRiskEngine.analyze(updated);
  db.recordStressAssessment({
    timestamp: updated.timestamp,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    heartRate: updated.heartRate,
    spo2: updated.spo2,
    steps: updated.steps,
    sleepHours: updated.sleepHours,
    moodScore: updated.moodScore,
    voiceStress: updated.voiceStress
  });

  return res.json({
    success: true,
    mode: 'HIGH_STRESS_TRIGGERED',
    reading: updated,
    risk
  });
});

router.post('/simulation/reset-normal', async (req: Request, res: Response) => {
  const updated = db.updateLatestSensorReading({
    heartRate: 72,
    spo2: 98,
    steps: 6420,
    sleepHours: 7.33,
    moodScore: 6,
    voiceStress: 'LOW'
  });

  const risk = await defaultRiskEngine.analyze(updated);
  db.recordStressAssessment({
    timestamp: updated.timestamp,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    heartRate: updated.heartRate,
    spo2: updated.spo2,
    steps: updated.steps,
    sleepHours: updated.sleepHours,
    moodScore: updated.moodScore,
    voiceStress: updated.voiceStress
  });

  return res.json({
    success: true,
    mode: 'RESET_NORMAL',
    reading: updated,
    risk
  });
});

export default router;
