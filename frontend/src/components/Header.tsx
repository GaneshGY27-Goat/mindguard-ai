import React from 'react';
import {
  Heart,
  Activity,
  ShieldCheck,
  Settings,
  User,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  Info
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'trends' | 'landing';
  onSelectTab: (tab: 'dashboard' | 'trends' | 'landing') => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenSos: () => void;
  onStartDemoMode: () => void;
  isBackendLive: boolean;
  currentUser: { name: string; email: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenAuth,
  onOpenSos,
  onStartDemoMode,
  isBackendLive,
  currentUser
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
              <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  MindGuard<span className="text-teal-400"> AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  PROTOTYPE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                Early Mental Wellness Warning & Support
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'trends'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>My Trends</span>
            </button>

            <button
              onClick={() => onSelectTab('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'landing'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Product Overview</span>
            </button>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Connection Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-400 font-medium">
              {isBackendLive ? 'API Connected' : 'Local Sandbox'}
            </span>
          </div>

          {/* DEMO MODE Button */}
          <button
            onClick={onStartDemoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>DEMO MODE</span>
          </button>

          {/* SOS Button */}
          <button
            onClick={onOpenSos}
            title="Always-accessible urgent safety net"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold tracking-wider transition shadow-lg shadow-rose-600/30 animate-pulse"
          >
            <AlertOctagon className="w-3.5 h-3.5 fill-white text-rose-600" />
            <span>SOS</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Trusted Contact & Settings"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User profile */}
          <button
            onClick={onOpenAuth}
            title={`Logged in as ${currentUser.name}`}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-xs font-semibold text-slate-300"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
