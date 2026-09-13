import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, Wind, CheckCircle2, Heart } from 'lucide-react';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseComplete?: (cycles: number) => void;
}

type Phase = 'READY' | 'INHALE' | 'HOLD' | 'EXHALE';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  onExerciseComplete
}) => {
  const [phase, setPhase] = useState<Phase>('READY');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Phase durations: Inhale 4s, Hold 4s, Exhale 6s
  const PHASE_DURATIONS: Record<Exclude<Phase, 'READY'>, number> = {
    INHALE: 4,
    HOLD: 4,
    EXHALE: 6
  };

  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          if (phase === 'READY' || phase === 'EXHALE') {
            if (phase === 'EXHALE') {
              setCompletedCycles((c) => {
                const nextC = c + 1;
                if (onExerciseComplete) onExerciseComplete(nextC);
                return nextC;
              });
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
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    if (phase === 'READY') {
      setPhase('INHALE');
      setSecondsLeft(PHASE_DURATIONS.INHALE);
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('READY');
    setSecondsLeft(4);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!isOpen) return null;

  // Determine scale and color based on phase
  const getPhaseStyles = () => {
    switch (phase) {
      case 'INHALE':
        return {
          scale: 'scale-125',
          color: 'from-teal-400 to-cyan-500',
          text: 'Inhale Slowly...',
          subtext: 'Draw air deeply into your diaphragm (4s)',
          ringColor: 'border-teal-400'
        };
      case 'HOLD':
        return {
          scale: 'scale-125',
          color: 'from-amber-400 to-teal-500',
          text: 'Hold Gently...',
          subtext: 'Notice stillness and relaxation (4s)',
          ringColor: 'border-amber-400'
        };
      case 'EXHALE':
        return {
          scale: 'scale-90',
          color: 'from-indigo-400 to-cyan-600',
          text: 'Exhale Completely...',
          subtext: 'Release all tension through pursed lips (6s)',
          ringColor: 'border-indigo-400'
        };
      default:
        return {
          scale: 'scale-100',
          color: 'from-teal-500 to-emerald-600',
          text: 'Ready to Begin',
          subtext: '4s Inhale • 4s Hold • 6s Exhale',
          ringColor: 'border-slate-600'
        };
    }
  };

  const currentStyles = getPhaseStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col items-center text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <Wind className="w-3.5 h-3.5" />
          <span>Vagal Nerve Stimulation • 4-4-6 Pacing</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Let's slow things down.
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Rhythmic breathing stimulates your parasympathetic system, naturally modulating elevated heart rate and stress.
        </p>

        {/* Animated Visual Breathing Sphere */}
        <div className="relative my-8 w-64 h-64 flex items-center justify-center">
          {/* Outer gentle ripple rings */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed ${currentStyles.ringColor} opacity-30 transition-all duration-1000 ${
              isActive ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '30s' }}
          />

          {/* Breathing Circle */}
          <div
            className={`w-44 h-44 rounded-full bg-gradient-to-tr ${currentStyles.color} shadow-2xl flex flex-col items-center justify-center text-slate-950 transition-all transform duration-[3500ms] ease-in-out ${
              isActive ? currentStyles.scale : 'scale-100'
            }`}
            style={{
              boxShadow: `0 0 50px rgba(45, 212, 191, 0.4)`
            }}
          >
            <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-950">
              {isActive ? secondsLeft : '4-4-6'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 mt-1">
              {phase === 'READY' ? 'Paced Reset' : phase}
            </span>
          </div>
        </div>

        {/* Instruction subtext */}
        <div className="h-12 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white transition-all">
            {currentStyles.text}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">
            {currentStyles.subtext}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 transition"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{phase === 'READY' ? 'Start Exercise' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm hover:bg-amber-500/30 transition"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleStop}
            disabled={phase === 'READY'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 disabled:opacity-40 transition"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Completed Cycles Counter & Benefit */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Completed Cycles: <strong className="text-white font-mono">{completedCycles}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Each cycle helps stabilize heart rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
