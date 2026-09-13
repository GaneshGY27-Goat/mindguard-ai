import React from 'react';
import { SensorReading } from '../types';
import { Heart, Activity, Moon, Smile, Mic, Wind } from 'lucide-react';

interface VitalsGridProps {
  reading: SensorReading;
  onOpenVoiceModal: () => void;
  onOpenMoodModal: () => void;
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({
  reading,
  onOpenVoiceModal,
  onOpenMoodModal
}) => {
  // Format sleep
  const hours = Math.floor(reading.sleepHours);
  const minutes = Math.round((reading.sleepHours - hours) * 60);
  const sleepStr = `${hours}h ${minutes > 0 ? `${minutes}m` : '00m'}`;

  // Voice stress color
  const getVoiceBadge = (lvl: string) => {
    switch (lvl) {
      case 'LOW':
        return { text: 'Low Stress', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' };
      case 'MEDIUM':
        return { text: 'Medium Stress', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' };
      case 'HIGH':
        return { text: 'High Stress', color: 'text-red-400 bg-red-950/60 border-red-500/30 animate-pulse' };
      default:
        return { text: lvl, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const voiceBadge = getVoiceBadge(reading.voiceStress);

  // Heart rate status
  const hrStatus =
    reading.heartRate > 100
      ? { label: 'Elevated', color: 'text-red-400' }
      : reading.heartRate > 85
      ? { label: 'Active', color: 'text-amber-400' }
      : { label: 'Resting Normal', color: 'text-emerald-400' };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
      {/* 1. Heart Rate */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className={`w-4 h-4 ${reading.heartRate > 90 ? 'animate-bounce' : ''}`} />
            </div>
            <span className="text-xs font-semibold text-slate-400">Heart Rate</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800/80 ${hrStatus.color}`}>
            {hrStatus.label}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {reading.heartRate}
          </span>
          <span className="text-xs font-medium text-slate-400">BPM</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Baseline: 70–75 BPM</span>
        </div>
      </div>

      {/* 2. Blood Oxygen SpO2 */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Blood Oxygen (SpO₂)</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            {reading.spo2 >= 97 ? 'Optimal' : 'Normal'}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {reading.spo2}
          </span>
          <span className="text-xs font-medium text-slate-400">%</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Target: 95–100%</span>
        </div>
      </div>

      {/* 3. Physical Activity */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Activity</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800/80 text-indigo-300">
            {Math.round((reading.steps / 8000) * 100)}% of goal
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {reading.steps.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">steps</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (reading.steps / 8000) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Sleep Duration */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Sleep</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              reading.sleepHours >= 7
                ? 'bg-purple-950/60 text-purple-300'
                : 'bg-amber-950/60 text-amber-300'
            }`}
          >
            {reading.sleepHours >= 7 ? 'Restorative' : 'Deficit'}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {sleepStr}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Target: 7h–9h / night</span>
        </div>
      </div>

      {/* 5. Mood Check-in */}
      <div
        onClick={onOpenMoodModal}
        className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smile className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Mood</span>
          </div>
          <span className="text-[10px] font-semibold text-teal-400 underline group-hover:text-teal-300">
            Log Mood &rarr;
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {reading.moodScore}
          </span>
          <span className="text-xs font-medium text-slate-400">/10</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>
            {reading.moodScore >= 7
              ? '😄 Feeling good & steady'
              : reading.moodScore >= 5
              ? '😐 Feeling neutral'
              : '🙁 Experiencing strain'}
          </span>
        </div>
      </div>

      {/* 6. Voice Stress Check */}
      <div
        onClick={onOpenVoiceModal}
        className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Voice Stress</span>
          </div>
          <span className="text-[10px] font-semibold text-teal-400 underline group-hover:text-teal-300">
            Audio Check &rarr;
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className={`text-xl font-bold px-2.5 py-1 rounded-lg border ${voiceBadge.color}`}>
            {voiceBadge.text}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Acoustic tension indicator</span>
        </div>
      </div>
    </div>
  );
};
