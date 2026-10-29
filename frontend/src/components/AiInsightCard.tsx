import React, { useState } from 'react';
import { RiskAnalysisResult } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Activity,
  Heart,
  Moon,
  Smile,
  Mic,
  Wind
} from 'lucide-react';

interface AiInsightCardProps {
  risk: RiskAnalysisResult;
  onStartBreathing: () => void;
  onContactTrusted: () => void;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({
  risk,
  onStartBreathing,
  onContactTrusted
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);
  const isHighOrVeryHigh = risk.riskLevel === 'HIGH' || risk.riskLevel === 'VERY HIGH';

  // Identify highest contributing factor
  const sortedFactors = [...risk.contributingFactors].sort(
    (a, b) => b.normalizedScore * b.weight - a.normalizedScore * a.weight
  );
  const topContributor = sortedFactors[0];

  const getFactorIcon = (id: string) => {
    switch (id) {
      case 'heart_rate':
        return Heart;
      case 'sleep':
        return Moon;
      case 'mood':
        return Smile;
      case 'voice_stress':
        return Mic;
      case 'activity':
        return Activity;
      case 'spo2':
        return Wind;
      default:
        return Activity;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-700/60 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Explainable Wellness Score Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">
              Transparent multi-signal telemetry & heuristic reasoning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-1.5 rounded-xl border border-teal-500/30 flex items-center gap-1.5 transition"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showFormulaDetails ? 'Hide Formula' : 'How Score is Calculated'}</span>
            {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Mathematical Formula Breakdown */}
      {showFormulaDetails && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-teal-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Signal Heuristic Formula (100% Transparent)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            The 0–100 wellness score is a weighted linear composite of 6 transparent biometric and self-reported inputs. No black-box predictions are made:
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-teal-300 overflow-x-auto">
            Score = (0.25 × Heart Rate) + (0.20 × Sleep Deficit) + (0.20 × Subjective Mood) + (0.20 × Voice Tension) + (0.10 × Activity) + (0.05 × SpO₂)
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Weights are based on peer-reviewed autonomic stress research: cardiovascular variations and restorative sleep have the strongest empirical correlation with acute physical arousal.
          </p>
        </div>
      )}

      {/* Generated Natural Language Explanation */}
      <div className="bg-slate-900/80 border border-teal-900/40 rounded-2xl p-4.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-teal-700" />
        <p className="text-sm font-medium text-slate-200 leading-relaxed pl-2">
          “{risk.aiSummary}”
        </p>

        {topContributor && (
          <div className="mt-3 pl-2 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Primary Impact Factor:</span>
            <span className="font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-lg border border-teal-800/40">
              {topContributor.name} ({topContributor.detail})
            </span>
          </div>
        )}
      </div>

      {/* Contributing Factors Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Signal Contribution & Impact
          </h4>
          <span className="text-[11px] text-slate-400">Weighted Scale</span>
        </div>

        <div className="space-y-3">
          {risk.contributingFactors.map((factor) => {
            const Icon = getFactorIcon(factor.id);
            const getBarColor = () => {
              if (factor.status === 'high') return 'bg-rose-500';
              if (factor.status === 'moderate') return 'bg-amber-500';
              if (factor.status === 'mild') return 'bg-yellow-500';
              return 'bg-emerald-500';
            };

            const getStatusLabel = () => {
              if (factor.status === 'high') return 'High Strain';
              if (factor.status === 'moderate') return 'Moderate Strain';
              if (factor.status === 'mild') return 'Mild Impact';
              return 'Favorable';
            };

            return (
              <div key={factor.id} className="space-y-1.5 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-teal-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200">{factor.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">
                        ({Math.round(factor.weight * 100)}% weight)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {factor.detail}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        factor.status === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : factor.status === 'moderate'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`${getBarColor()} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(6, factor.normalizedScore)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Non-Medical Clinical Disclaimer Callout */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
          <strong className="text-amber-300 font-semibold block">
            Experimental Non-Medical Research Notice:
          </strong>
          <span>
            This wellness score is an experimental indicator intended solely for personal self-awareness and lifestyle tracking. It is <strong>NOT a clinical diagnosis, medical evaluation, or reliable prediction of any psychiatric or mental health condition</strong>. MindGuard AI does not claim clinical accuracy or substitute for certified mental healthcare. If you are in crisis or experiencing persistent distress, please consult a healthcare professional.
          </span>
        </div>
      </div>

      {/* Personalized Supportive Recommendations */}
      <div className="border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
          <span>Personalized Supportive Actions</span>
          <span className="text-[10px] lowercase font-normal text-slate-400">
            Current Tier: {risk.riskLevel}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {risk.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-850/60 border border-slate-800/70 text-xs text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onStartBreathing}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-teal-500/20"
        >
          <span>Start 60-Second Breathing Exercise</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {isHighOrVeryHigh && (
          <button
            onClick={onContactTrusted}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Contact Support Network</span>
          </button>
        )}
      </div>
    </div>
  );
};
