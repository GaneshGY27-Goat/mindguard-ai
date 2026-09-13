import React from 'react';
import { RiskAnalysisResult } from '../types';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const isHighOrVeryHigh = risk.riskLevel === 'HIGH' || risk.riskLevel === 'VERY HIGH';

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Wellness Insight & Explainability
            </h3>
            <span className="text-[11px] text-slate-400">
              Multi-signal explainable reasoning engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium bg-slate-800 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Transparent Weighted Scoring
          </span>
        </div>
      </div>

      {/* Generated Natural Language Explanation */}
      <div className="bg-slate-900/80 border border-teal-900/40 rounded-2xl p-4.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-teal-700" />
        <p className="text-sm font-medium text-slate-200 leading-relaxed pl-1.5">
          “{risk.aiSummary}”
        </p>
        <p className="text-[11px] text-slate-500 mt-2 pl-1.5">
          * Note: This explanation highlights observable trends from your sensors and self-reports. It is not an anxiety disorder diagnosis or medical conclusion.
        </p>
      </div>

      {/* Contributing Factors Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Signal Contribution Breakdown
          </h4>
          <span className="text-[11px] text-slate-400">Weighted Influence</span>
        </div>

        <div className="space-y-2.5">
          {risk.contributingFactors.map((factor) => {
            const getBarColor = () => {
              if (factor.status === 'high') return 'bg-rose-500';
              if (factor.status === 'moderate') return 'bg-amber-500';
              if (factor.status === 'mild') return 'bg-yellow-500';
              return 'bg-emerald-500';
            };

            return (
              <div key={factor.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">{factor.name}</span>
                    <span className="text-[10px] text-slate-500">
                      ({Math.round(factor.weight * 100)}% weight)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {factor.detail}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden flex">
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

      {/* Personalized Supportive Recommendations */}
      <div className="border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
          <span>Personalized Supportive Actions</span>
          <span className="text-[10px] lowercase font-normal text-slate-400">
            State: {risk.riskLevel}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {risk.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-850/60 border border-slate-800/70 text-xs text-slate-300"
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
          <span>Start 4-4-6 Breathing Exercise</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {isHighOrVeryHigh && (
          <button
            onClick={onContactTrusted}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Contact Trusted Person</span>
          </button>
        )}
      </div>
    </div>
  );
};
