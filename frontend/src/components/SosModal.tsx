import React, { useState } from 'react';
import { X, AlertOctagon, HeartHandshake, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TrustedContact } from '../types';
import { notifyTrustedDemo } from '../services/api';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContact?: TrustedContact;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  trustedContact
}) => {
  const [notified, setNotified] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleContactTrusted = async () => {
    try {
      await notifyTrustedDemo();
      setNotified(true);
      setTimeout(() => {
        setNotified(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl shadow-rose-950/40 text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Are you sure you want to request help?
        </h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          If you are feeling overwhelmed, distressed, or unsafe, support is immediately available.
        </p>

        {notified ? (
          <div className="my-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulated message dispatched to {trustedContact?.name || 'Trusted Contact'}!</span>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {/* Primary Action: Contact Trusted Person */}
            <button
              onClick={handleContactTrusted}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Contact Trusted Person ({trustedContact?.name || 'Family'})</span>
            </button>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Crisis Support Hotlines (Non-automated, informative) */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-left space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            <span>24/7 Confidential Crisis Resources:</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span>988 Suicide & Crisis Lifeline:</span>
              <span className="font-bold text-teal-400 font-mono">Call or Text 988 (USA/CAN)</span>
            </div>
            <div className="flex justify-between">
              <span>Crisis Text Line:</span>
              <span className="font-bold text-teal-400 font-mono">Text HOME to 741741</span>
            </div>
            <div className="flex justify-between">
              <span>India Tele-MANAS Mental Health:</span>
              <span className="font-bold text-teal-400 font-mono">14416 (24x7 Free)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic text-center pt-1">
            * Note: For prototype testing, emergency authorities (e.g. 911/112) are not automatically dispatched.
          </p>
        </div>
      </div>
    </div>
  );
};
