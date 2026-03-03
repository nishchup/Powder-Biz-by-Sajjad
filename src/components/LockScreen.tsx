import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  // Default PIN is 1234 for demo purposes
  const CORRECT_PIN = '1234';

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
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

        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
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

        <div className="text-center text-sm text-slate-500">
          Demo PIN: <span className="font-mono font-bold text-slate-700">1234</span>
        </div>
      </div>
    </div>
  );
}
