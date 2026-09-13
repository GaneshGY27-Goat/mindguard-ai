import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

type AuthTab = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState<string>('alex.mercer@example.com');
  const [password, setPassword] = useState<string>('MindGuard2026!');
  const [name, setName] = useState<string>('Alex Mercer');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'forgot') {
      setSuccessMsg(`Password reset instructions simulated to ${email}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      return;
    }

    onLoginSuccess({
      name: tab === 'signup' ? name : 'Alex Mercer',
      email
    });
    onClose();
  };

  const handleOneClickDemo = () => {
    setEmail('demo.user@mindguard.ai');
    setPassword('DemoTest123!');
    setName('Demo Explorer');
    onLoginSuccess({
      name: 'Demo Explorer',
      email: 'demo.user@mindguard.ai'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Account Access
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          {tab === 'login' ? 'Welcome Back' : tab === 'signup' ? 'Create Account' : 'Reset Password'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {tab === 'login'
            ? 'Sign in to access your biometric history & personalized wellness insights'
            : tab === 'signup'
            ? 'Start your proactive mental wellness monitoring profile'
            : 'Enter your email to receive simulated password recovery link'}
        </p>

        {/* Tab switch */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 my-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              tab === 'login' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              tab === 'signup' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setTab('forgot')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              tab === 'forgot' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Forgot
          </button>
        </div>

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@example.com"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-95 transition shadow-lg shadow-teal-500/20"
          >
            {tab === 'login' ? 'Sign In' : tab === 'signup' ? 'Complete Registration' : 'Send Reset Link'}
          </button>
        </form>

        {/* 1-Click Fast Demo Login button */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleOneClickDemo}
            className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-teal-300 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>1-Click Fast Prototype Login (Demo User)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
