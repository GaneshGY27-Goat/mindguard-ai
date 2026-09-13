import {
  SensorReading,
  MoodEntry,
  StressRecord,
  TrustedContact,
  UserProfile,
  RiskLevel
} from '../types';

export class DataStore {
  public user: UserProfile;
  public latestReading: SensorReading;
  public sensorHistory: SensorReading[] = [];
  public moodEntries: MoodEntry[] = [];
  public stressHistory: StressRecord[] = [];
  public contacts: TrustedContact[] = [];

  constructor() {
    this.user = {
      id: 'usr_demo_01',
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      baselineHeartRate: 72,
      targetSleep: 8.0,
      targetSteps: 8000
    };

    this.latestReading = {
      id: 'sr_latest',
      userId: this.user.id,
      timestamp: new Date().toISOString(),
      heartRate: 72,
      spo2: 98,
      steps: 6420,
      sleepHours: 7.33, // 7h 20m
      moodScore: 6,
      voiceStress: 'LOW'
    };

    this.contacts = [
      {
        id: 'tc_01',
        userId: this.user.id,
        name: 'Sarah Mercer (Mother)',
        phone: '+1 (555) 382-9912',
        relationship: 'Parent / Family',
        notifyOnHighRisk: true,
        lastNotified: undefined
      }
    ];

    this.seedHistoricalData();
  }

  public getLatestSensorReading(): SensorReading {
    return { ...this.latestReading };
  }

  public updateLatestSensorReading(
    reading: Partial<Omit<SensorReading, 'userId'>>
  ): SensorReading {
    this.latestReading = {
      ...this.latestReading,
      ...reading,
      timestamp: new Date().toISOString()
    };

    // Store into rolling sensor history
    this.sensorHistory.push({ ...this.latestReading, id: `sr_${Date.now()}` });
    if (this.sensorHistory.length > 200) {
      this.sensorHistory.shift();
    }

    return { ...this.latestReading };
  }

  public addMoodEntry(entry: Omit<MoodEntry, 'id' | 'userId' | 'timestamp'>): MoodEntry {
    const newEntry: MoodEntry = {
      id: `mood_${Date.now()}`,
      userId: this.user.id,
      timestamp: new Date().toISOString(),
      score: entry.score,
      label: entry.label,
      notes: entry.notes
    };
    this.moodEntries.unshift(newEntry);

    // Also update current moodScore in latest sensor reading
    this.updateLatestSensorReading({ moodScore: entry.score });

    return newEntry;
  }

  public getMoodHistory(limit = 14): MoodEntry[] {
    return this.moodEntries.slice(0, limit);
  }

  public recordStressAssessment(record: Omit<StressRecord, 'id' | 'userId'>): StressRecord {
    const newRecord: StressRecord = {
      id: `str_${Date.now()}`,
      userId: this.user.id,
      ...record
    };
    this.stressHistory.push(newRecord);
    return newRecord;
  }

  public getTrends(timeframe: 'today' | '7days' | '30days' = '7days') {
    const now = new Date();
    let cutoffDays = 7;
    if (timeframe === 'today') cutoffDays = 1;
    if (timeframe === '30days') cutoffDays = 30;

    const cutoffTime = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

    const filteredRecords = this.stressHistory.filter(
      (r) => new Date(r.timestamp) >= cutoffTime
    );

    // Calculate aggregated statistics
    const avgStress =
      filteredRecords.length > 0
        ? Math.round(
            filteredRecords.reduce((acc, r) => acc + r.riskScore, 0) /
              filteredRecords.length
          )
        : 42;

    const avgSleep =
      filteredRecords.length > 0
        ? Number(
            (
              filteredRecords.reduce((acc, r) => acc + r.sleepHours, 0) /
              filteredRecords.length
            ).toFixed(1)
          )
        : 7.2;

    const avgHeartRate =
      filteredRecords.length > 0
        ? Math.round(
            filteredRecords.reduce((acc, r) => acc + r.heartRate, 0) /
              filteredRecords.length
          )
        : 74;

    const avgMood =
      filteredRecords.length > 0
        ? Number(
            (
              filteredRecords.reduce((acc, r) => acc + r.moodScore, 0) /
              filteredRecords.length
            ).toFixed(1)
          )
        : 6.4;

    return {
      timeframe,
      records: filteredRecords,
      summary: {
        avgStress,
        avgSleep,
        avgHeartRate,
        avgMood,
        totalObservations: filteredRecords.length,
        trendDirection: avgStress < 50 ? 'improving' : 'elevated'
      },
      aiInsight:
        timeframe === '30days'
          ? 'Over the last 30 days, higher sleep durations (>7.5 hours) strongly coincided with stress risk scores below 35. This observed correlation reflects healthier lifestyle resilience in this prototype dataset.'
          : timeframe === '7days'
          ? 'Your average stress score has decreased over the last 7 days. Regular sleep patterns and consistent daily steps appear to be associated with lower stress scores in this prototype dataset.'
          : 'Today\'s biometric timeline indicates balanced heart rate levels during morning hours, with a slight afternoon fluctuation consistent with standard daily rhythms.'
    };
  }

  public getContacts(): TrustedContact[] {
    return [...this.contacts];
  }

  public updateContact(contact: Partial<TrustedContact>): TrustedContact {
    if (this.contacts.length === 0) {
      const created: TrustedContact = {
        id: 'tc_01',
        userId: this.user.id,
        name: contact.name || 'Primary Contact',
        phone: contact.phone || '',
        relationship: contact.relationship || 'Support',
        notifyOnHighRisk: contact.notifyOnHighRisk ?? true
      };
      this.contacts.push(created);
      return created;
    }

    this.contacts[0] = {
      ...this.contacts[0],
      ...contact
    };
    return this.contacts[0];
  }

  private seedHistoricalData(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Seed 30 daily stress records
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * dayMs);
      // Realistic fluctuation: a couple stressful days 2 weeks ago, improving recently
      const dayFactor = i > 12 && i < 16 ? 1 : 0; // brief stress spike in history
      const hr = 70 + Math.round(Math.sin(i * 0.4) * 6) + dayFactor * 18;
      const sleep = Number((7.4 + Math.cos(i * 0.3) * 0.9 - dayFactor * 2.2).toFixed(1));
      const steps = Math.round(6500 + Math.sin(i * 0.8) * 2200 - dayFactor * 3000);
      const mood = Math.min(9, Math.max(2, Math.round(6.8 + Math.cos(i * 0.5) * 1.5 - dayFactor * 2.5)));
      const riskScore = Math.min(
        88,
        Math.max(16, Math.round(38 - (sleep - 7) * 8 + (hr - 70) * 0.8 - (mood - 6) * 5 + (dayFactor ? 28 : 0)))
      );

      let riskLevel: RiskLevel = 'NORMAL';
      if (riskScore > 80) riskLevel = 'VERY HIGH';
      else if (riskScore > 60) riskLevel = 'HIGH';
      else if (riskScore > 30) riskLevel = 'MODERATE';

      this.stressHistory.push({
        id: `str_seed_${i}`,
        userId: this.user.id,
        timestamp: date.toISOString(),
        riskScore,
        riskLevel,
        heartRate: hr,
        spo2: 98 - (dayFactor ? 1 : 0),
        steps,
        sleepHours: sleep,
        moodScore: mood,
        voiceStress: dayFactor ? 'HIGH' : i % 4 === 0 ? 'MEDIUM' : 'LOW'
      });
    }

    // Seed 7 mood entries
    const moodLabels: Array<MoodEntry['label']> = [
      'Good',
      'Good',
      'Okay',
      'Very Good',
      'Okay',
      'Good',
      'Good'
    ];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * dayMs + 10 * 3600 * 1000);
      const score = [7, 7, 5, 8, 6, 7, 6][6 - i];
      this.moodEntries.push({
        id: `mood_seed_${i}`,
        userId: this.user.id,
        timestamp: date.toISOString(),
        score,
        label: moodLabels[6 - i],
        notes: i === 0 ? 'Feeling steady and focused today.' : undefined
      });
    }
  }
}

export const db = new DataStore();
