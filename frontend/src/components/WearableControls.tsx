import React from 'react';
import { Play, Pause, AlertOctagon, RotateCcw, Radio } from 'lucide-react';

interface WearableControlsProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onTriggerHighStress: () => void;
  onResetNormal: () => void;
  onSimulateOnce: () => void;
}

export const WearableControls: React.FC<WearableControlsProps> = ({
  isSimulating,
  onToggleSimulation,
  onTriggerHighStress,
  onResetNormal,
  onSimulateOnce
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left title & live status indicator */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex items-center justify-center">
          <Radio className={`w-5 h-5 ${isSimulating ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />
          {isSimulating && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Wearable Sensor Simulation
            </h4>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isSimulating
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSimulating ? 'STREAMING ACTIVE (3s)' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Generate synthetic multi-signal telemetry or test clinical edge-case scenarios
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Toggle Live Streaming Simulation */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            isSimulating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
          }`}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'Pause Stream' : 'Simulate Wearable Data'}</span>
        </button>

        {/* Single Step Pulse */}
        <button
          onClick={onSimulateOnce}
          title="Generate single random telemetry sample"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <span>Step Random</span>
        </button>

        {/* Trigger High-Stress Scenario */}
        <button
          onClick={onTriggerHighStress}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>Trigger High-Stress Scenario</span>
        </button>

        {/* Reset to Normal */}
        <button
          onClick={onResetNormal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset to Normal</span>
        </button>
      </div>
    </div>
  );
};
