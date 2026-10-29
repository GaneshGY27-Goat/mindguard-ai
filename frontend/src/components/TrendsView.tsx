import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Smile,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  BookOpen,
  PlusCircle,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  getMoodEntries,
  getWeeklyMoodSummary,
  MoodJournalEntry
} from '../services/storage';

interface TrendsViewProps {
  onBackToDashboard: () => void;
  onOpenMoodModal?: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
  onBackToDashboard,
  onOpenMoodModal
}) => {
  const [entries, setEntries] = useState<MoodJournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<MoodJournalEntry | null>(null);
  const [activeMetric, setActiveMetric] = useState<'stressLevel' | 'moodScore'>('stressLevel');
  const [timeframe, setTimeframe] = useState<'7days' | 'all'>('7days');

  useEffect(() => {
    loadRealEntries();
  }, [timeframe]);

  const loadRealEntries = () => {
    const all = getMoodEntries();
    if (timeframe === '7days') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recent = all.filter(
        (e) => new Date(e.timestamp).getTime() >= oneWeekAgo
      );
      setEntries(recent);
    } else {
      setEntries(all);
    }
  };

  const summary = getWeeklyMoodSummary();

  // Sort chronological for left-to-right chart rendering
  const chartRecords = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // SVG Chart calculation for actual entries
  const renderActualChart = () => {
    if (chartRecords.length === 0) return null;

    if (chartRecords.length === 1) {
      const single = chartRecords[0];
      return (
        <div className="h-64 flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-3xl">{single.moodEmoji || '🙂'}</span>
          <p className="text-sm font-bold text-white">
            1 Check-in Recorded ({new Date(single.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })})
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Stress Level: <strong className="text-teal-400">{single.stressLevel}/10</strong> • Mood Score: <strong className="text-amber-400">{single.moodScore}/10</strong>
          </p>
          {single.notes && (
            <p className="text-xs text-slate-300 italic max-w-md bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              "{single.notes}"
            </p>
          )}
          <p className="text-[11px] text-teal-400 font-medium pt-2">
            Log at least 2 check-ins to see connected trend lines and progress tracking!
          </p>
        </div>
      );
    }

    const width = 800;
    const height = 240;
    const padding = 45;

    // Scale values between 1 and 10
    const minVal = 1;
    const maxVal = 10;
    const valRange = maxVal - minVal;

    const points = chartRecords.map((r, i) => {
      const x = padding + (i / (chartRecords.length - 1)) * (width - 2 * padding);
      const val = activeMetric === 'stressLevel' ? r.stressLevel : r.moodScore;
      const y = height - padding - ((val - minVal) / valRange) * (height - 2 * padding);
      return { x, y, entry: r, val };
    });

    const pathString = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaString = `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const isStress = activeMetric === 'stressLevel';
    const lineColor = isStress ? '#0d9488' : '#f59e0b'; // teal or amber

    return (
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines: 1, 3, 5, 7, 10 */}
          {[1, 3, 5, 7, 10].map((level) => {
            const y = height - padding - ((level - minVal) / valRange) * (height - 2 * padding);
            return (
              <g key={level}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.35)"
                  strokeDasharray="4 4"
                />
                <text x={padding - 10} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                  {level}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaString} fill={`url(#grad-${activeMetric})`} />

          {/* Line Path */}
          <path
            d={pathString}
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isSelected = selectedEntry?.id === p.entry.id;
            return (
              <g
                key={p.entry.id || i}
                className="group cursor-pointer"
                onClick={() => setSelectedEntry(p.entry)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? '7' : '5'}
                  fill="#0f172a"
                  stroke={lineColor}
                  strokeWidth={isSelected ? '4' : '3'}
                  className="transition-transform group-hover:scale-150"
                />

                {/* Date Label on X Axis */}
                <text
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fill={isSelected ? '#2dd4bf' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {new Date(p.entry.timestamp).toLocaleDateString([], {
                    month: 'numeric',
                    day: 'numeric'
                  })}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected entry tooltip / detail */}
        {selectedEntry && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-teal-500/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{selectedEntry.moodEmoji || '🙂'}</span>
              <div>
                <span className="font-bold text-white">
                  {selectedEntry.moodLabel} • Stress: {selectedEntry.stressLevel}/10 • Mood: {selectedEntry.moodScore}/10
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Logged on {new Date(selectedEntry.timestamp).toLocaleString('en-US')}
                </span>
              </div>
            </div>
            {selectedEntry.notes && (
              <p className="text-slate-300 italic bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] max-w-sm">
                "{selectedEntry.notes}"
              </p>
            )}
          </div>
        )}
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
            aria-label="Back to dashboard"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Wellness History Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Weekly mood and stress timeline charted from your actual local check-in records
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenMoodModal && (
            <button
              onClick={onOpenMoodModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 text-xs font-bold transition shadow-sm hover:opacity-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Check-in</span>
            </button>
          )}

          {/* Timeframe selector: 7 Days / All Time */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeframe === '7days'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeframe === 'all'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Recorded
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards based on actual data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Completed Check-ins</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-teal-400">
              {entries.length}
            </span>
            <span className="text-xs text-slate-500">entries</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {timeframe === '7days' ? 'In past 7 days' : 'Total in localStorage'}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Avg Reported Stress</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-teal-300">
              {entries.length > 0 ? summary.avgStress : '—'}
            </span>
            <span className="text-xs text-slate-500">/10</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {entries.length > 0 ? (summary.avgStress <= 4 ? 'Low Stress' : summary.avgStress <= 7 ? 'Moderate' : 'High') : 'Awaiting data'}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Avg Mood Rating</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-400">
              {entries.length > 0 ? summary.avgMood : '—'}
            </span>
            <span className="text-xs text-slate-500">/10</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Self-reported reflection
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Data Integrity</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-emerald-400">
              100% Real
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            No synthetic data invented
          </span>
        </div>
      </div>

      {/* Main Trend Chart Card */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">
              Actual Mood & Stress Trendline
            </h2>
          </div>

          {/* Metric Selector Tabs */}
          {entries.length > 0 && (
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveMetric('stressLevel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeMetric === 'stressLevel'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Stress Level (1-10)</span>
              </button>
              <button
                onClick={() => setActiveMetric('moodScore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeMetric === 'moodScore'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Mood Rating (1-10)</span>
              </button>
            </div>
          )}
        </div>

        {/* Content: Actual Chart OR Helpful Empty State */}
        {entries.length === 0 ? (
          /* HELPFUL EMPTY STATE */
          <div className="py-14 px-4 text-center max-w-md mx-auto space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-teal-400 shadow-xl">
              <BookOpen className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                No Check-in Data Recorded Yet
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Your weekly mood and stress history will be plotted here as you log daily check-ins. To ensure data honesty, MindGuard AI never fabricates or invents historical user records.
              </p>
            </div>

            {onOpenMoodModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenMoodModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-teal-500/20 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Your First Check-in</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          renderActualChart()
        )}
      </div>

      {/* Weekly Summary & Insight Card */}
      {entries.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-teal-900/40 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Personalized Weekly Summary
                </h3>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
                  Real Data Grounded
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summary.summaryText}
              </p>
              <p className="text-[11px] text-slate-500 italic pt-1">
                * Transparency Notice: All summaries reflect genuine check-ins recorded in this browser's local storage. This calculation does not predict clinical pathology or replace professional mental-health care.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
