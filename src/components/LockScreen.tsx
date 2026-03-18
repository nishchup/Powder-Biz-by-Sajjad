import * as React from 'react';
import { useState } from 'react';
import { Lock, Unlock, AlertCircle, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { state, setAppPin } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  const handleUnlock = (enteredPin: string) => {
    if (enteredPin === state.appPin) {
      setError(false);
      onUnlock();
    } else if (enteredPin.length === 4) {
      setError(true);
      setPin('');
    }
  };

  const handlePinChange = (enteredPin: string) => {
    setPin(enteredPin);
    setError(false);
    if (enteredPin.length === 4) {
      handleUnlock(enteredPin);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUnlock(pin);
  };

  const handleResetPin = () => {
    if (window.confirm('Are you sure you want to reset the PIN to default (1234)?')) {
      setAppPin('1234');
      alert('PIN has been reset to 1234');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">App Locked</h2>
          <p className="text-slate-500 mt-2">Enter your PIN to access the dashboard</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              className="block w-full text-center text-3xl tracking-widest rounded-xl border-slate-300 py-4 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center text-red-600 space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Incorrect PIN. Try again.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Unlock className="h-5 w-5 mr-2" />
            Unlock
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={handleResetPin}
            className="flex items-center text-xs text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw size={14} className="mr-1.5" />
            Reset PIN to Default
          </button>
        </div>
      </div>
    </div>
  );
}
