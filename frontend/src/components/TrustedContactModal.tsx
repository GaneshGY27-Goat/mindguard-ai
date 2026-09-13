import React, { useState } from 'react';
import { X, UserPlus, Phone, HeartHandshake, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { TrustedContact } from '../types';
import { updateContact, notifyTrustedDemo } from '../services/api';

interface TrustedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContact?: TrustedContact;
  onContactUpdated?: (c: TrustedContact) => void;
}

export const TrustedContactModal: React.FC<TrustedContactModalProps> = ({
  isOpen,
  onClose,
  initialContact,
  onContactUpdated
}) => {
  const [name, setName] = useState<string>(initialContact?.name || 'Sarah Mercer (Mother)');
  const [phone, setPhone] = useState<string>(initialContact?.phone || '+91 98765 43210');
  const [relationship, setRelationship] = useState<string>(initialContact?.relationship || 'Parent / Family');
  const [notifyOnHighRisk, setNotifyOnHighRisk] = useState<boolean>(initialContact?.notifyOnHighRisk ?? true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dispatchPreview, setDispatchPreview] = useState<{
    recipient: string;
    phone: string;
    messagePreview: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await updateContact({
        name,
        phone,
        relationship,
        notifyOnHighRisk
      });
      if (onContactUpdated) onContactUpdated(saved);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateContactTrigger = async () => {
    const result = await notifyTrustedDemo();
    setDispatchPreview(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Safety Net & Support Circle
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Trusted Contact Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specify a designated family member or trusted confidant for optional supportive wellness outreach.
        </p>

        {dispatchPreview ? (
          <div className="my-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated Outreach Modal</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-200 font-mono space-y-1">
              <div><strong>To:</strong> {dispatchPreview.recipient} ({dispatchPreview.phone})</div>
              <div><strong>Status:</strong> Simulated Delivery (Demo Sandbox)</div>
              <div className="pt-2 text-slate-300">"{dispatchPreview.messagePreview}"</div>
            </div>
            <p className="text-[11px] text-slate-400">
              * Note: Prototype safety mode. No real cellular SMS or cellular carriers were charged.
            </p>
            <button
              onClick={() => setDispatchPreview(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              Back to Settings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mother / John Doe"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX or +1 (555) 000-0000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Relationship</label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Family, Partner, Mentor, Counselor"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="notifyToggle"
                checked={notifyOnHighRisk}
                onChange={(e) => setNotifyOnHighRisk(e.target.checked)}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
              />
              <label htmlFor="notifyToggle" className="text-xs text-slate-300 cursor-pointer">
                Allow 1-click quick contact when High or Very High stress is detected
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
              >
                {isSaving ? 'Saving...' : 'Save Contact'}
              </button>

              <button
                type="button"
                onClick={handleSimulateContactTrigger}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Notification</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
          <span>
            Privacy Guard: Trusted contact notifications always require your explicit manual confirmation before any payload is dispatched. No background messaging occurs without consent.
          </span>
        </div>
      </div>
    </div>
  );
};
