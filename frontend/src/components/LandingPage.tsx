import React from 'react';
import {
  Heart,
  Activity,
  ShieldCheck,
  Sparkles,
  Wind,
  Lock,
  ArrowRight,
  Cpu,
  Smile,
  Mic,
  AlertTriangle,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onStartDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onStartDemo
}) => {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-teal-500 selection:text-white space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Healthcare Innovation Prototype • Early Stress Detection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
          Understand your wellness. <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Act earlier. Stay connected.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          MindGuard AI combines multi-channel physiological vitals, subjective mood check-ins, and vocal acoustic tension into an explainable <strong>Stress Risk Score (0–100)</strong> with immediate non-medical supportive interventions.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition transform hover:scale-105"
          >
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onStartDemo}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm transition"
          >
            <Play className="w-4 h-4 fill-teal-400 text-teal-400" />
            <span>Interactive 2-Min Demo</span>
          </button>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div className="mt-10 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto flex items-start gap-2.5 text-left text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Prototype / Research Demo:</strong> MindGuard AI estimates stress and mental-wellness risk based on available proxy indicators. It does NOT claim to diagnose depression, anxiety disorders, or predict panic attacks with certainty.
          </span>
        </div>
      </section>

      {/* 2. Problem & Solution */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-rose-900/30 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">The Healthcare Challenge</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Mental stress and autonomic fatigue frequently accumulate silently. By the time individuals recognize severe burnout or anxiety spikes, physiological dysregulation has already peaked. Existing consumer trackers present siloed data without actionable, early supportive interventions.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-teal-900/30 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">The MindGuard AI Solution</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A unified multi-signal framework that computes an explainable early risk index from heart rate variability, sleep patterns, physical movement, mood ratings, and voice stress. When stress indicators elevate, the system immediately recommends calming 4-4-6 guided breathing and connects with loved ones.
          </p>
        </div>
      </section>

      {/* 3. System Architecture & Information Flow */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            End-to-End Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            How MindGuard AI Operates
          </h2>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {[
            { step: '01', title: 'WEARABLE / SENSOR DATA', desc: 'HR, SpO₂, Steps, Sleep, Voice Audio', color: 'border-teal-500/30' },
            { step: '02', title: 'DATA PROCESSING', desc: 'Noise filtering, feature extraction & telemetry normalization', color: 'border-cyan-500/30' },
            { step: '03', title: 'AI RISK ANALYSIS', desc: 'Configurable weighted heuristics or ML ensemble', color: 'border-indigo-500/30' },
            { step: '04', title: 'STRESS RISK SCORE', desc: '0–100 Scale: Normal, Moderate, High, Very High', color: 'border-amber-500/30' },
            { step: '05', title: 'PERSONALIZED SUPPORT', desc: '4-4-6 pacing, break guidance, trusted contact alert', color: 'border-emerald-500/30' }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`glass-panel p-4 rounded-2xl border ${item.color} flex flex-col items-center justify-between text-center space-y-2`}
            >
              <span className="text-[10px] font-extrabold text-teal-400 font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                {item.step}
              </span>
              <h4 className="text-xs font-bold text-white leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for Proactive Wellness Awareness
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <Activity className="w-6 h-6 text-teal-400" />
            <h3 className="text-base font-bold text-white">Live Multi-Sensor Dashboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors continuous biometric data streams including resting heart rate, oxygenation, sleep duration, and active step counts.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <Wind className="w-6 h-6 text-cyan-400" />
            <h3 className="text-base font-bold text-white">4-4-6 Guided Breathing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive breathing visualizer that stimulates the vagus nerve and triggers parasympathetic recovery, dynamically lowering simulated stress.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <Mic className="w-6 h-6 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Voice Stress Wellness Check</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts non-identifying acoustic tension and pitch jitter proxies using browser Web Audio API, processing audio entirely in volatile memory.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <Smile className="w-6 h-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">Subjective Mood Calibration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log daily mood with emoji states and 1–10 sliders to calibrate algorithms with how the user actually feels subjectively.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Transparent Explainability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No black-box mystery. Users see the exact weighted influence of each biomarker and receive plain-language summaries of what is driving their score.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <Cpu className="w-6 h-6 text-rose-400" />
            <h3 className="text-base font-bold text-white">Modular ML Integration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered with a clean <code className="text-teal-300">predictStress()</code> interface, ready for drop-in replacement with Random Forest, XGBoost, or LSTM models.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Privacy & Data Ethics */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center gap-2.5 text-teal-400">
            <Lock className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Privacy & Ethical Data Commitment</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Biometric and mental wellness data are deeply personal. MindGuard AI adheres to core privacy principles:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Client-Side Audio:</strong> Audio used for voice wellness is processed in volatile browser memory and never recorded or uploaded.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Explicit Consent:</strong> Sharing notifications with trusted contacts requires user confirmation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Encryption Standards:</strong> Production designs require end-to-end TLS encryption and AES-256 at rest.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>Non-Diagnostic Boundaries:</strong> System never assumes clinical authority or dispenses prescriptive medication.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center px-4">
        <h2 className="text-2xl font-bold text-white">
          Experience the MindGuard AI Prototype Today
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Explore real-time wearable telemetry, trigger high-stress simulations, and test interactive breathing.
        </p>
        <button
          onClick={onEnterDashboard}
          className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition"
        >
          <span>Launch Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
