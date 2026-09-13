import React, { useState, useEffect } from 'react';
import { Play, Check, ChevronRight, X, Sparkles, RefreshCw } from 'lucide-react';

interface DemoModeTourProps {
  isActive: boolean;
  onClose: () => void;
  onResetNormal: () => void;
  onTriggerHighStress: () => void;
  onOpenBreathing: () => void;
  onCloseBreathing: () => void;
  onApplyBreathingRecovery: () => void;
  onOpenTrends: () => void;
  onCloseTrends: () => void;
  onOpenTrustedContact: () => void;
  onCloseTrustedContact: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  actionText: string;
}

const DEMO_STEPS: Step[] = [
  {
    id: 1,
    title: '1. Dashboard Overview',
    description: 'Welcome to MindGuard AI. Review the centralized multi-modal mental wellness monitoring interface.',
    actionText: 'View Baseline State'
  },
  {
    id: 2,
    title: '2. Live Normal Vitals',
    description: 'Notice resting heart rate (72 BPM), SpO₂ (98%), healthy step activity, and balanced sleep rest.',
    actionText: 'Inspect Normal Vitals'
  },
  {
    id: 3,
    title: '3. Stress Risk = NORMAL',
    description: 'The circular gauge reflects a low estimated stress risk (~23/100) with autonomic balance.',
    actionText: 'Trigger Stress Simulation'
  },
  {
    id: 4,
    title: '4. Trigger High-Stress Scenario',
    description: 'Simulating acute real-world stressors: HR jumps to 105 BPM, sleep deficit (4.5h), low movement, high vocal tension.',
    actionText: 'Apply High-Stress Telemetry'
  },
  {
    id: 5,
    title: '5. Sensor Values Update',
    description: 'Dashboard cards reflect immediate biometric shifts in real time.',
    actionText: 'Observe Risk Calculation'
  },
  {
    id: 6,
    title: '6. AI Risk Score Escalates',
    description: 'The risk engine calculates an elevated stress score (>80/100, HIGH/VERY HIGH), shifting gauge color.',
    actionText: 'Inspect Explainability'
  },
  {
    id: 7,
    title: '7. AI Explainability & Drivers',
    description: 'The AI transparently identifies primary contributors: elevated heart rate and restricted sleep.',
    actionText: 'Review Recommendations'
  },
  {
    id: 8,
    title: '8. Personalized Recommendations',
    description: 'Supportive guidance prompts 4-4-6 guided breathing and a quiet environment.',
    actionText: 'Start Guided Breathing'
  },
  {
    id: 9,
    title: '9. Start 4-4-6 Breathing Exercise',
    description: 'Launching rhythmic diaphragmatic pacing (Inhale 4s, Hold 4s, Exhale 6s) to stimulate vagal recovery.',
    actionText: 'Simulate Recovery Effect'
  },
  {
    id: 10,
    title: '10. Parasympathetic Recovery',
    description: 'Breathing cycles take effect: heart rate drops from 105 to 76 BPM; stress score steadily decreases.',
    actionText: 'Explore Trends & History'
  },
  {
    id: 11,
    title: '11. Trends & Correlation History',
    description: 'Reviewing longitudinal charts (Today, 7D, 30D) and observational AI summaries.',
    actionText: 'Review Safety Net'
  },
  {
    id: 12,
    title: '12. Trusted Contact & Safety Net',
    description: 'For elevated states, the user can notify a trusted family member with 1 click. Full demo complete!',
    actionText: 'Finish Demo'
  }
];

export const DemoModeTour: React.FC<DemoModeTourProps> = ({
  isActive,
  onClose,
  onResetNormal,
  onTriggerHighStress,
  onOpenBreathing,
  onCloseBreathing,
  onApplyBreathingRecovery,
  onOpenTrends,
  onCloseTrends,
  onOpenTrustedContact,
  onCloseTrustedContact
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    if (isActive) {
      setCurrentStepIndex(0);
      onResetNormal();
    }
  }, [isActive]);

  if (!isActive) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNextStep = () => {
    const nextIdx = currentStepIndex + 1;

    // Trigger actions corresponding to step transitions
    switch (currentStep.id) {
      case 1:
      case 2:
      case 3:
        // Reset to normal
        onCloseBreathing();
        onCloseTrends();
        onCloseTrustedContact();
        onResetNormal();
        break;
      case 4:
        // Trigger high stress
        onTriggerHighStress();
        break;
      case 5:
      case 6:
      case 7:
        // Ensure high stress is active and visible on dashboard
        onCloseBreathing();
        onCloseTrends();
        break;
      case 8:
        // Launch breathing
        onOpenBreathing();
        break;
      case 9:
        // Breathing recovery effect
        onApplyBreathingRecovery();
        break;
      case 10:
        // Close breathing, open trends
        onCloseBreathing();
        onOpenTrends();
        break;
      case 11:
        // Close trends, open trusted contact
        onCloseTrends();
        onOpenTrustedContact();
        break;
      case 12:
        // Complete demo
        onCloseTrustedContact();
        onClose();
        return;
    }

    if (nextIdx < DEMO_STEPS.length) {
      setCurrentStepIndex(nextIdx);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="glass-panel rounded-3xl p-5 border border-teal-500/50 shadow-2xl shadow-teal-950/60 bg-slate-900/95 backdrop-blur-xl space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Guided Prototype Demo Tour
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400">
              Step {currentStep.id} of {DEMO_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {currentStep.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {DEMO_STEPS.map((s, idx) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-teal-400'
                    : idx < currentStepIndex
                    ? 'w-1.5 bg-teal-600'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onResetNormal();
                setCurrentStepIndex(0);
              }}
              title="Restart Demo"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <span>{currentStep.actionText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
