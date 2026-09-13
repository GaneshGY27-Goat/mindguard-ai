import React, { useState, useEffect, useRef } from 'react';
import {
  SensorReading,
  RiskAnalysisResult,
  VoiceStressLevel,
  TrustedContact,
  MoodEntry
} from './types';
import {
  fetchLatestData,
  sendSensorData,
  triggerHighStressScenario,
  triggerResetNormal,
  submitMoodEntry,
  fetchMoodHistory,
  fetchContacts
} from './services/api';
import { Header } from './components/Header';
import { StressGauge } from './components/StressGauge';
import { VitalsGrid } from './components/VitalsGrid';
import { AiInsightCard } from './components/AiInsightCard';
import { WearableControls } from './components/WearableControls';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import { MoodCheckInModal } from './components/MoodCheckInModal';
import { VoiceStressModal } from './components/VoiceStressModal';
import { TrendsView } from './components/TrendsView';
import { AssistantChat } from './components/AssistantChat';
import { TrustedContactModal } from './components/TrustedContactModal';
import { SosModal } from './components/SosModal';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DemoModeTour } from './components/DemoModeTour';
import { AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'landing'>('dashboard');

  // Modal open states
  const [showBreathing, setShowBreathing] = useState<boolean>(false);
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showTrustedContact, setShowTrustedContact] = useState<boolean>(false);
  const [showSos, setShowSos] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);

  // User state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com'
  });

  // Core biometric telemetry & risk assessment state
  const [reading, setReading] = useState<SensorReading>({
    userId: 'usr_demo',
    timestamp: new Date().toISOString(),
    heartRate: 72,
    spo2: 98,
    steps: 6420,
    sleepHours: 7.33,
    moodScore: 6,
    voiceStress: 'LOW'
  });

  const [risk, setRisk] = useState<RiskAnalysisResult>({
    riskScore: 23,
    riskLevel: 'NORMAL',
    calculatedAt: new Date().toISOString(),
    contributingFactors: [
      { id: 'heart_rate', name: 'Heart Rate Variation', weight: 0.25, normalizedScore: 10, impactPercentage: 15, status: 'favorable', detail: '72 BPM (Calm, resting)' },
      { id: 'sleep', name: 'Sleep Duration & Rest', weight: 0.20, normalizedScore: 15, impactPercentage: 15, status: 'favorable', detail: '7h 20m (Restorative)' },
      { id: 'mood', name: 'Self-Reported Mood', weight: 0.20, normalizedScore: 44, impactPercentage: 35, status: 'mild', detail: '6/10 (Neutral/Steady)' },
      { id: 'voice_stress', name: 'Voice Stress Tone', weight: 0.20, normalizedScore: 10, impactPercentage: 15, status: 'favorable', detail: 'LOW tension' },
      { id: 'activity', name: 'Physical Movement', weight: 0.10, normalizedScore: 25, impactPercentage: 15, status: 'favorable', detail: '6,420 steps' },
      { id: 'spo2', name: 'Blood Oxygen (SpO₂)', weight: 0.05, normalizedScore: 5, impactPercentage: 5, status: 'favorable', detail: '98%' }
    ],
    aiSummary: 'Your current biometric and lifestyle indicators reflect stable, balanced baseline conditions. Restful recovery and healthy vitals are supporting your resilience today.',
    recommendations: [
      'Continue your normal daily routine and maintain balance',
      'Stay hydrated throughout the day with regular water intake',
      'Maintain regular sleep schedule for tonight (target 7–8 hours)'
    ],
    modelType: 'heuristic_weighted',
    disclaimer: 'Prototype Risk Model – Not a Medical Diagnostic Model.'
  });

  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [trustedContact, setTrustedContact] = useState<TrustedContact | undefined>(undefined);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simIntervalRef = useRef<any>(null);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const data = await fetchLatestData();
      setReading(data.reading);
      setRisk(data.risk);
      setIsBackendLive(true);
    } catch {
      setIsBackendLive(false);
    }

    try {
      const moods = await fetchMoodHistory();
      setRecentMoods(moods);
      const contacts = await fetchContacts();
      if (contacts.length > 0) setTrustedContact(contacts[0]);
    } catch (err) {
      console.warn(err);
    }
  };

  // Continuous wearable streaming simulation handler
  useEffect(() => {
    if (!isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    simIntervalRef.current = setInterval(async () => {
      // Random walk generator bounded to realistic sensor limits
      setReading((prev) => {
        const deltaHr = Math.round((Math.random() - 0.48) * 4);
        const newHr = Math.min(125, Math.max(58, prev.heartRate + deltaHr));

        const deltaSteps = Math.floor(Math.random() * 15);
        const newSteps = prev.steps + deltaSteps;

        const updated: SensorReading = {
          ...prev,
          heartRate: newHr,
          steps: newSteps,
          timestamp: new Date().toISOString()
        };

        // Async dispatch update to backend
        sendSensorData(updated)
          .then((res) => {
            setRisk(res.risk);
          })
          .catch(() => {});

        return updated;
      });
    }, 3000);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating]);

  // Action handlers
  const handleToggleSimulation = () => {
    setIsSimulating((s) => !s);
  };

  const handleSimulateOnce = async () => {
    const randomHr = Math.floor(65 + Math.random() * 45); // 65-110
    const randomSpo2 = Math.floor(96 + Math.random() * 4); // 96-100
    const randomSteps = Math.floor(2000 + Math.random() * 10000);
    const randomSleep = Number((4.5 + Math.random() * 4.5).toFixed(1));
    const randomMood = Math.floor(2 + Math.random() * 8);
    const voiceOpts: VoiceStressLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
    const randomVoice = voiceOpts[Math.floor(Math.random() * voiceOpts.length)];

    const updated = await sendSensorData({
      heartRate: randomHr,
      spo2: randomSpo2,
      steps: randomSteps,
      sleepHours: randomSleep,
      moodScore: randomMood,
      voiceStress: randomVoice
    });
    setReading(updated.reading);
    setRisk(updated.risk);
  };

  const handleTriggerHighStress = async () => {
    setIsSimulating(false);
    const res = await triggerHighStressScenario();
    setReading(res.reading);
    setRisk(res.risk);
  };

  const handleResetNormal = async () => {
    setIsSimulating(false);
    const res = await triggerResetNormal();
    setReading(res.reading);
    setRisk(res.risk);
  };

  const handleApplyBreathingRecovery = async () => {
    // Breathing decreases autonomic arousal: drops HR towards 74, restores calm
    const updated = await sendSensorData({
      heartRate: 74,
      voiceStress: 'LOW'
    });
    setReading(updated.reading);
    setRisk(updated.risk);
  };

  const handleSaveMood = async (score: number, label: string, notes?: string) => {
    const entry = await submitMoodEntry({ score, label, notes });
    setRecentMoods((prev) => [entry, ...prev]);
    const updated = await sendSensorData({ moodScore: score });
    setReading(updated.reading);
    setRisk(updated.risk);
  };

  const handleApplyVoiceStress = async (level: VoiceStressLevel) => {
    const updated = await sendSensorData({ voiceStress: level });
    setReading(updated.reading);
    setRisk(updated.risk);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setShowTrustedContact(true)}
        onOpenAuth={() => setShowAuth(true)}
        onOpenSos={() => setShowSos(true)}
        onStartDemoMode={() => {
          setActiveTab('dashboard');
          setShowDemoTour(true);
        }}
        isBackendLive={isBackendLive}
        currentUser={currentUser}
      />

      {/* Guided 12-Step Interactive Demo Mode Tour Overlay */}
      <DemoModeTour
        isActive={showDemoTour}
        onClose={() => setShowDemoTour(false)}
        onResetNormal={handleResetNormal}
        onTriggerHighStress={handleTriggerHighStress}
        onOpenBreathing={() => setShowBreathing(true)}
        onCloseBreathing={() => setShowBreathing(false)}
        onApplyBreathingRecovery={handleApplyBreathingRecovery}
        onOpenTrends={() => setActiveTab('trends')}
        onCloseTrends={() => setActiveTab('dashboard')}
        onOpenTrustedContact={() => setShowTrustedContact(true)}
        onCloseTrustedContact={() => setShowTrustedContact(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'landing' ? (
          <LandingPage
            onEnterDashboard={() => setActiveTab('dashboard')}
            onStartDemo={() => {
              setActiveTab('dashboard');
              setShowDemoTour(true);
            }}
          />
        ) : activeTab === 'trends' ? (
          <TrendsView onBackToDashboard={() => setActiveTab('dashboard')} />
        ) : (
          /* Main Interactive Dashboard */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Prototype Notice Banner */}
            <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-teal-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
                <span>
                  <strong>Clinical Prototype Notice:</strong> MindGuard AI estimates stress risk based on multi-signal indicators. Not a medical diagnostic device.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowDemoTour(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-semibold text-[11px] transition"
                >
                  Start Demo Tour &rarr;
                </button>
              </div>
            </div>

            {/* Wearable Simulation Controls Toolbar */}
            <WearableControls
              isSimulating={isSimulating}
              onToggleSimulation={handleToggleSimulation}
              onTriggerHighStress={handleTriggerHighStress}
              onResetNormal={handleResetNormal}
              onSimulateOnce={handleSimulateOnce}
            />

            {/* Primary Vitals & Risk Gauge Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Circular Stress Risk Gauge (42/100, MODERATE, Smooth Animation) */}
              <div className="lg:col-span-4 flex flex-col justify-stretch">
                <StressGauge
                  score={risk.riskScore}
                  level={risk.riskLevel}
                  calculatedAt={risk.calculatedAt}
                />
              </div>

              {/* 6 Live Vitals Cards */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <VitalsGrid
                  reading={reading}
                  onOpenVoiceModal={() => setShowVoiceModal(true)}
                  onOpenMoodModal={() => setShowMoodModal(true)}
                />
              </div>
            </div>

            {/* AI Insight & Explainability + Personalized Recommendations */}
            <div>
              <AiInsightCard
                risk={risk}
                onStartBreathing={() => setShowBreathing(true)}
                onContactTrusted={() => setShowTrustedContact(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating MindGuard AI Assistant Chat */}
      <AssistantChat
        onTriggerBreathing={() => setShowBreathing(true)}
        onTriggerMood={() => setShowMoodModal(true)}
        onTriggerTrends={() => setActiveTab('trends')}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
          <Heart className="w-3.5 h-3.5 text-teal-400" />
          <span>MindGuard AI Prototype • Engineering Innovation in Early Mental Wellness Warning</span>
        </div>
        <p className="text-[11px] text-slate-600">
          This system is an experimental healthcare engineering demo. It does not diagnose, treat, or cure medical conditions.
        </p>
      </footer>

      {/* Interactive Modals */}
      <BreathingExerciseModal
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
        onExerciseComplete={() => {
          handleApplyBreathingRecovery();
        }}
      />

      <MoodCheckInModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        currentMoodScore={reading.moodScore}
        onSaveMood={handleSaveMood}
        recentMoods={recentMoods}
      />

      <VoiceStressModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        currentLevel={reading.voiceStress}
        onApplyVoiceStress={handleApplyVoiceStress}
      />

      <TrustedContactModal
        isOpen={showTrustedContact}
        onClose={() => setShowTrustedContact(false)}
        initialContact={trustedContact}
        onContactUpdated={(c) => setTrustedContact(c)}
      />

      <SosModal
        isOpen={showSos}
        onClose={() => setShowSos(false)}
        trustedContact={trustedContact}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLoginSuccess={(usr) => setCurrentUser(usr)}
      />
    </div>
  );
};

export default App;
