import React, { useState, useEffect } from 'react';
import { TrendsData, StressRecord } from '../types';
import { fetchTrends } from '../services/api';
import { TrendingUp, Activity, Moon, Heart, Smile, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

interface TrendsViewProps {
  onBackToDashboard: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ onBackToDashboard }) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('7days');
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'riskScore' | 'heartRate' | 'sleepHours' | 'moodScore' | 'steps'>('riskScore');

  useEffect(() => {
    loadTrends(timeframe);
  }, [timeframe]);

  const loadTrends = async (tf: 'today' | '7days' | '30days') => {
    setLoading(true);
    try {
      const data = await fetchTrends(tf);
      setTrends(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const records = trends?.records || [];

  // Helper to compute SVG path coordinates
  const renderSvgChart = (metric: typeof activeMetric) => {
    if (records.length < 2) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
          Not enough historical records yet. Record more readings or simulate data.
        </div>
      );
    }

    const width = 800;
    const height = 220;
    const padding = 35;

    const values = records.map((r) => r[metric] as number);
    const minVal = Math.min(...values) * 0.85;
    const maxVal = Math.max(...values) * 1.15 || 100;
    const valRange = maxVal - minVal || 1;

    const points = records.map((r, i) => {
      const x = padding + (i / (records.length - 1)) * (width - 2 * padding);
      const y = height - padding - (((r[metric] as number) - minVal) / valRange) * (height - 2 * padding);
      return { x, y, record: r };
    });

    const pathString = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaString = `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const getMetricConfig = () => {
      switch (metric) {
        case 'riskScore':
          return { label: 'Stress Risk (0-100)', color: '#0d9488', gradient: 'from-teal-500/30 to-transparent' };
        case 'heartRate':
          return { label: 'Heart Rate (BPM)', color: '#f43f5e', gradient: 'from-rose-500/30 to-transparent' };
        case 'sleepHours':
          return { label: 'Sleep Duration (Hours)', color: '#a855f7', gradient: 'from-purple-500/30 to-transparent' };
        case 'moodScore':
          return { label: 'Subjective Mood (1-10)', color: '#f59e0b', gradient: 'from-amber-500/30 to-transparent' };
        case 'steps':
          return { label: 'Physical Activity (Steps)', color: '#6366f1', gradient: 'from-indigo-500/30 to-transparent' };
      }
    };

    const cfg = getMetricConfig();

    return (
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (height - 2 * padding);
            const gridVal = Math.round(maxVal - ratio * valRange);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="4 4"
                />
                <text x={padding - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaString} fill={`url(#grad-${metric})`} />

          {/* Line Path */}
          <path
            d={pathString}
            fill="none"
            stroke={cfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#0f172a"
                stroke={cfg.color}
                strokeWidth="2.5"
                className="transition-transform group-hover:scale-150"
              />
              {/* Date Label on X Axis */}
              {(timeframe !== '30days' || i % 4 === 0) && (
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {timeframe === 'today'
                    ? new Date(p.record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date(p.record.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              My Trends & Historical Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Longitudinal tracking of multi-modal biomarkers and stress correlation models
            </p>
          </div>
        </div>

        {/* Timeframe selector: Today / 7 Days / 30 Days */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {(['today', '7days', '30days'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === 'today' ? 'Today' : tf === '7days' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {trends && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Avg Stress Score</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-teal-400">
                {trends.summary.avgStress}
              </span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
              Trend: {trends.summary.trendDirection}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Avg Sleep Rest</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-purple-400">
                {trends.summary.avgSleep}
              </span>
              <span className="text-xs text-slate-500">hours</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Target: 7.5–8.5h
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Avg Heart Rate</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-rose-400">
                {trends.summary.avgHeartRate}
              </span>
              <span className="text-xs text-slate-500">BPM</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Resting baseline
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Avg Mood Rating</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-400">
                {trends.summary.avgMood}
              </span>
              <span className="text-xs text-slate-500">/10</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Self-reported
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Chart Card */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">
              Biometric & Stress Timeline
            </h2>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'riskScore', label: 'Stress Score', icon: TrendingUp },
              { key: 'heartRate', label: 'Heart Rate', icon: Heart },
              { key: 'sleepHours', label: 'Sleep', icon: Moon },
              { key: 'moodScore', label: 'Mood', icon: Smile },
              { key: 'steps', label: 'Activity', icon: Activity }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = activeMetric === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-slate-800 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Chart */}
        {renderSvgChart(activeMetric)}
      </div>

      {/* AI Trend Correlation Insight Card */}
      {trends && (
        <div className="glass-panel rounded-3xl p-6 border border-teal-900/40 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  AI Trend Analysis & Signal Correlations
                </h3>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
                  Observation Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                “{trends.aiInsight}”
              </p>
              <p className="text-[11px] text-slate-500 italic pt-1">
                * Scientific Notice: Statistical correlations displayed here are observational summaries of prototype readings. They do not constitute formal medical or psychiatric diagnostic conclusions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
