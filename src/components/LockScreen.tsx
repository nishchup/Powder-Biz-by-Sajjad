import * as React from 'react';
import { useState, useCallback } from 'react';
import { Lock, Unlock, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { state, setAppPin } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  
  const handleUnlock = useCallback((enteredPin: string) => {
    if (enteredPin === state.appPin) {
      setError(false);
      onUnlock();
    } else if (enteredPin.length === 4) {
      setError(true);
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 400);
      setPin('');
    }
  }, [state.appPin, onUnlock]);

  const handlePinChange = useCallback((enteredPin: string) => {
    if (enteredPin.length > 4) return;
    setPin(enteredPin);
    setError(false);
    if (enteredPin.length === 4) {
      handleUnlock(enteredPin);
    }
  }, [handleUnlock]);

  const handleResetPin = () => {
    if (window.confirm('Reset PIN to 1234?')) {
      setAppPin('1234');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      handlePinChange(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Optimized Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[80px] rounded-full" />
      </div>
      
      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-transform duration-300 hover:scale-105">
            {pin.length === 4 && !error ? (
              <Unlock className="h-10 w-10 text-emerald-400 animate-in zoom-in duration-200" />
            ) : (
              <Lock className="h-10 w-10 text-indigo-400 animate-in zoom-in duration-200" />
            )}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Secure Access</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Identity Verification Required</p>
        </div>

        <div className={`space-y-8 transition-transform duration-75 ${isVibrating ? 'translate-x-1 animate-bounce' : ''}`}>
          {/* PIN Indicators */}
          <div className="flex justify-center gap-5 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-full border border-white/10 transition-all duration-200 shadow-lg
                  ${pin.length > i 
                    ? 'bg-indigo-500 scale-125 shadow-indigo-500/50 border-indigo-400' 
                    : 'bg-white/10 scale-100 shadow-none'
                  }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center text-rose-400 space-x-2 bg-rose-500/10 py-2.5 rounded-2xl border border-rose-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Invalid Security Code</span>
            </div>
          )}

          {/* Optimized Keypad */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 rounded-2xl text-white text-2xl font-bold transition-all active:scale-90 flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleResetPin}
              className="h-16 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 rounded-2xl text-slate-500 hover:text-indigo-400 transition-all active:scale-90 flex items-center justify-center"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-16 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 rounded-2xl text-white text-2xl font-bold transition-all active:scale-90 flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 rounded-2xl text-slate-500 hover:text-rose-400 transition-all active:scale-90 flex items-center justify-center"
            >
              <RotateCcw size={20} className="rotate-180" />
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/5 shadow-inner">
            <ShieldCheck size={14} className="text-indigo-500" />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Secure Session Active</span>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-30">
        <p className="text-white text-[9px] uppercase tracking-[0.4em] font-black">
          Protected by AES-256
        </p>
      </div>
    </div>
  );
}
