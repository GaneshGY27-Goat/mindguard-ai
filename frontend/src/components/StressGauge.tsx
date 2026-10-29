import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

interface StressGaugeProps {
  score: number;
  level: RiskLevel;
  calculatedAt?: string;
}

export const StressGauge: React.FC<StressGaugeProps> = ({ score, level }) => {
  // SVG gauge constants
  const size = 260;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle: 260 degrees arc for a semi-circular gauge feel
  const arcPercentage = 0.75;
  const totalArcLength = circumference * arcPercentage;
  const strokeDashoffset = totalArcLength - (score / 100) * totalArcLength;
  const rotation = 135; // degrees

  const getLevelConfig = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'NORMAL':
        return {
          color: '#10b981', // emerald-500
          bgColor: 'rgba(16, 185, 129, 0.12)',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: ShieldCheck,
          label: 'NORMAL',
          subtext: 'Optimal autonomic balance and low estimated stress.'
        };
      case 'MODERATE':
        return {
          color: '#f59e0b', // amber-500
          bgColor: 'rgba(245, 158, 11, 0.12)',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: AlertCircle,
          label: 'MODERATE',
          subtext: 'Mild physical or mental strain detected. Consider pausing.'
        };
      case 'HIGH':
        return {
          color: '#f97316', // orange-500
          bgColor: 'rgba(249, 115, 22, 0.12)',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          icon: AlertTriangle,
          label: 'HIGH',
          subtext: 'Elevated stress indicators active. Breathing recommended.'
        };
      case 'VERY HIGH':
        return {
          color: '#ef4444', // red-500
          bgColor: 'rgba(239, 68, 68, 0.15)',
          badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse',
          icon: Flame,
          label: 'VERY HIGH',
          subtext: 'Substantial cumulative strain. De-escalate and seek support.'
        };
    }
  };

  const config = getLevelConfig(level);
  const IconComponent = config.icon;

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden border border-slate-700/50 shadow-2xl">
      {/* Background ambient glow matching current level */}
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl -top-10 -right-10 pointer-events-none transition-all duration-700 opacity-30"
        style={{ backgroundColor: config.color }}
      />

      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Real-Time Assessment
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
          Prototype Model
        </span>
      </div>

      {/* SVG Circular Dial */}
      <div className="relative my-3 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.45)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.85s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease',
              filter: `drop-shadow(0 0 10px ${config.color}88)`
            }}
          />
        </svg>

        {/* Center text content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Stress Risk
          </span>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span
              className="text-5xl font-extrabold tracking-tight transition-all duration-500"
              style={{ color: config.color }}
            >
              {score}
            </span>
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${config.badgeClass}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Description and disclaimer */}
      <div className="w-full text-center space-y-1.5 mt-2">
        <p className="text-xs text-slate-300 font-medium px-4">
          {config.subtext}
        </p>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-[10px] text-slate-400">
          Experimental wellness score • Non-medical estimate • Not a diagnosis or clinical prediction
        </div>
      </div>

    </div>
  );
};
