import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Wind,
  CheckCircle2,
  Heart,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { recordBreathingSession } from '../services/storage';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseComplete?: (cycles: number) => void;
}

type Phase = 'READY' | 'INHALE' | 'HOLD' | 'EXHALE';

const SESSION_DURATION_SECONDS = 60; // 60-second guided session

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  onExerciseComplete
}) => {
  const [phase, setPhase] = useState<Phase>('READY');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number>(SESSION_DURATION_SECONDS);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [exerciseStatus, setExerciseStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Phase pacing: 4s Inhale, 4s Hold, 6s Exhale
  const PHASE_DURATIONS: Record<Exclude<Phase, 'READY'>, number> = {
    INHALE: 4,
    HOLD: 4,
    EXHALE: 6
  };

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  // Main active timer tick
  useEffect(() => {
    if (exerciseStatus !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // 1. Decrement overall 60-second session timer
      setSessionSecondsRemaining((prevTotal) => {
        if (prevTotal <= 1) {
          // Session reached 60 seconds completion!
          handleSessionFinished();
          return 0;
        }
        return prevTotal - 1;
      });

      // 2. Decrement and transition current breathing phase
      setPhaseSecondsLeft((prevPhaseSec) => {
        if (prevPhaseSec <= 1) {
          // Advance to next phase
          if (phase === 'READY' || phase === 'EXHALE') {
            if (phase === 'EXHALE') {
              setCompletedCycles((c) => c + 1);
            }
            setPhase('INHALE');
            return PHASE_DURATIONS.INHALE;
          } else if (phase === 'INHALE') {
            setPhase('HOLD');
            return PHASE_DURATIONS.HOLD;
          } else if (phase === 'HOLD') {
            setPhase('EXHALE');
            return PHASE_DURATIONS.EXHALE;
          }
          return 4;
        }
        return prevPhaseSec - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exerciseStatus, phase]);

  const handleSessionFinished = () => {
    setExerciseStatus('completed');
    setPhase('READY');
    if (timerRef.current) clearInterval(timerRef.current);

    const finalCycles = completedCycles + (phase === 'EXHALE' ? 1 : 0);
    recordBreathingSession(SESSION_DURATION_SECONDS, Math.max(1, finalCycles));

    if (onExerciseComplete) {
      onExerciseComplete(Math.max(1, finalCycles));
    }
  };

  const handleStart = () => {
    setExerciseStatus('running');
    if (phase === 'READY') {
      setPhase('INHALE');
      setPhaseSecondsLeft(PHASE_DURATIONS.INHALE);
    }
  };

  const handlePause = () => {
    setExerciseStatus('paused');
  };

  const handleResume = () => {
    setExerciseStatus('running');
  };

  const handleReset = () => {
    setExerciseStatus('idle');
    setPhase('READY');
    setPhaseSecondsLeft(4);
    setSessionSecondsRemaining(SESSION_DURATION_SECONDS);
    setCompletedCycles(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!isOpen) return null;

  // Phase visual styles
  const getPhaseStyles = () => {
    switch (phase) {
      case 'INHALE':
        return {
          scaleClass: prefersReducedMotion ? 'opacity-100' : 'scale-110 sm:scale-125',
          bgGradient: 'from-teal-400 to-cyan-500',
          ringColor: 'border-teal-400',
          title: 'Inhale Slowly...',
          subtext: 'Breathe in deeply through your nose, expanding diaphragm (4s)',
          ariaText: 'Inhale for 4 seconds'
        };
      case 'HOLD':
        return {
          scaleClass: prefersReducedMotion ? 'opacity-90' : 'scale-110 sm:scale-125',
          bgGradient: 'from-amber-400 to-teal-500',
          ringColor: 'border-amber-400',
          title: 'Hold Gently...',
          subtext: 'Notice stillness and relax facial muscles & shoulders (4s)',
          ariaText: 'Hold for 4 seconds'
        };
      case 'EXHALE':
        return {
          scaleClass: prefersReducedMotion ? 'opacity-70' : 'scale-90',
          bgGradient: 'from-indigo-400 to-cyan-600',
          ringColor: 'border-indigo-400',
          title: 'Exhale Completely...',
          subtext: 'Slowly release all air through gently pursed lips (6s)',
          ariaText: 'Exhale for 6 seconds'
        };
      default:
        return {
          scaleClass: 'scale-100',
          bgGradient: 'from-teal-500 to-emerald-600',
          ringColor: 'border-slate-700',
          title: '60-Second Guided Pacing',
          subtext: '4s Inhale • 4s Hold • 6s Exhale (Vagal Nerve Reset)',
          ariaText: 'Ready to start'
        };
    }
  };

  const currentStyles = getPhaseStyles();
  const sessionProgressPercent = Math.min(
    100,
    Math.round(((SESSION_DURATION_SECONDS - sessionSecondsRemaining) / SESSION_DURATION_SECONDS) * 100)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Breathing Exercise"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <Wind className="w-3.5 h-3.5" />
          <span>Vagal Nerve Stimulation • 4-4-6 Pacing</span>
        </div>

        <h2 id="breathing-modal-title" className="text-2xl font-bold text-white tracking-tight">
          Interactive Breathing Exercise
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Take 60 seconds to calm your autonomic nervous system and lower cardiovascular strain.
        </p>

        {/* Screen Reader Live Announcement */}
        <div aria-live="polite" className="sr-only">
          {exerciseStatus === 'running'
            ? `${currentStyles.ariaText}. ${phaseSecondsLeft} seconds remaining in this step.`
            : exerciseStatus === 'completed'
            ? '60-second breathing session completed.'
            : 'Breathing exercise ready to start.'}
        </div>

        {exerciseStatus === 'completed' ? (
          /* COMPLETION VIEW */
          <div className="my-6 p-6 rounded-3xl bg-slate-900/90 border border-teal-500/40 w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-teal-500/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                🎉 60-Second Session Complete!
              </h3>
              <p className="text-xs text-teal-300 mt-1 font-medium">
                Great job taking time for your well-being today.
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Slow diaphragmatic breathing engages your parasympathetic nervous system, helping stabilize elevated heart rate and reduce physiological tension.
            </p>

            <div className="grid grid-cols-2 gap-2 text-left bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Duration</span>
                <span className="font-bold text-white font-mono">60 Seconds</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Cycles Completed</span>
                <span className="font-bold text-teal-400 font-mono">{completedCycles || 4} Cycles</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
              >
                Do Another 60s Session
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE ANIMATION VIEW */
          <>
            {/* Session Progress Bar (60s) */}
            <div className="w-full max-w-xs mt-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Session Progress</span>
                <span className="font-mono font-bold text-teal-300">
                  {SESSION_DURATION_SECONDS - sessionSecondsRemaining}s / {SESSION_DURATION_SECONDS}s
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={sessionProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${sessionProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Animated Visual Breathing Sphere */}
            <div className="relative my-6 w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              {/* Outer gentle ripple rings */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed ${currentStyles.ringColor} opacity-30 transition-all duration-1000 ${
                  exerciseStatus === 'running' && !prefersReducedMotion ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '30s' }}
              />

              {/* Breathing Circle with CSS transitions and reduced-motion fallback */}
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr ${currentStyles.bgGradient} shadow-2xl flex flex-col items-center justify-center text-slate-950 transition-all transform duration-[3500ms] ease-in-out ${
                  exerciseStatus === 'running' ? currentStyles.scaleClass : 'scale-100'
                }`}
                style={{
                  boxShadow: '0 0 45px rgba(45, 212, 191, 0.45)'
                }}
              >
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-950">
                  {exerciseStatus === 'running' || exerciseStatus === 'paused'
                    ? phaseSecondsLeft
                    : '60s'}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mt-0.5">
                  {phase === 'READY' ? 'Paced Reset' : phase}
                </span>
              </div>
            </div>

            {/* Instruction subtext */}
            <div className="h-12 flex flex-col items-center justify-center px-4">
              <span className="text-sm font-bold text-white transition-all">
                {currentStyles.title}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 max-w-sm">
                {currentStyles.subtext}
              </span>
            </div>

            {/* Comprehensive Controls: Start, Pause, Resume, Reset */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              {/* START (Idle state) */}
              {exerciseStatus === 'idle' && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/25 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start 60s Exercise</span>
                </button>
              )}

              {/* PAUSE (Running state) */}
              {exerciseStatus === 'running' && (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm hover:bg-amber-500/30 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              {/* RESUME (Paused state) */}
              {exerciseStatus === 'paused' && (
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/25 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Resume</span>
                </button>
              )}

              {/* RESET (Available anytime active or paused) */}
              <button
                type="button"
                onClick={handleReset}
                disabled={exerciseStatus === 'idle'}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Reduced Motion Toggle / Notification */}
            {prefersReducedMotion && (
              <span className="text-[10px] text-teal-400/80 mt-3 block">
                Reduced motion mode active (gentle opacity transitions enabled).
              </span>
            )}

            {/* Completed Cycles Counter Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>
                  Cycles: <strong className="text-white font-mono">{completedCycles}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>60s resets heart rate strain</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
