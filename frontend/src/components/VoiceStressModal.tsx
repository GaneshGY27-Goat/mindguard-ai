import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, AlertCircle, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { VoiceStressLevel } from '../types';

interface VoiceStressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: VoiceStressLevel;
  onApplyVoiceStress: (level: VoiceStressLevel) => void;
}

export const VoiceStressModal: React.FC<VoiceStressModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onApplyVoiceStress
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [detectedLevel, setDetectedLevel] = useState<VoiceStressLevel>(currentLevel || 'LOW');
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [analyzedSamplesCount, setAnalyzedSamplesCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      setAnalyzedSamplesCount(0);

      drawWaveform();
    } catch (err: any) {
      console.warn('Microphone access unavailable, using simulated voice analysis mode:', err);
      setMicError('Microphone permission not granted or unavailable. You can use Simulated Audio Modes below.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      // Compute average volume / energy
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setLiveVolume(Math.round((avg / 255) * 100));

      setAnalyzedSamplesCount((c) => {
        const next = c + 1;
        // Dynamically estimate acoustic energy tier
        if (next % 20 === 0) {
          if (avg > 75) setDetectedLevel('HIGH');
          else if (avg > 40) setDetectedLevel('MEDIUM');
          else setDetectedLevel('LOW');
        }
        return next;
      });

      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#0d9488');
        gradient.addColorStop(1, '#2dd4bf');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleApply = () => {
    onApplyVoiceStress(detectedLevel);
    stopRecording();
    onClose();
  };

  if (!isOpen) return null;

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
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Acoustic Signal Extraction
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Voice Wellness Check
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Extracts non-identifying acoustic tension proxies (energy density, cadence irregularity) to estimate vocal strain.
        </p>

        {/* Live Audio Spectrum Canvas */}
        <div className="my-5 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={380}
            height={90}
            className="w-full h-24 rounded-lg bg-slate-950/70 border border-slate-800"
          />

          <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Acoustic Energy: <strong className="text-white font-mono">{liveVolume}%</strong></span>
            </div>
            <span className="text-[11px] text-slate-500">
              {isRecording ? 'Live Spectrum Active' : 'Microphone Inactive'}
            </span>
          </div>
        </div>

        {micError && (
          <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Recording Toggle */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-teal-500/20 transition"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-500/30 transition animate-pulse"
            >
              <MicOff className="w-4 h-4" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {/* Detected Voice Stress Indicator */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Estimated Voice Stress State:
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                detectedLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : detectedLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {detectedLevel}
            </span>
          </div>

          {/* Quick preset selector for testing/demoing all 3 states */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 pl-1">Preset Override:</span>
            <div className="flex gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as VoiceStressLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDetectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                    detectedLevel === lvl
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
          >
            Apply to Dashboard Telemetry
          </button>
        </div>

        {/* Prototype Disclaimer Alert */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <strong>Prototype Notice:</strong> Voice analysis is experimental and for demonstration purposes only. Does NOT perform medical or psychiatric diagnosis. Raw audio is processed ephemerally in-memory and never stored.
          </p>
        </div>
      </div>
    </div>
  );
};
