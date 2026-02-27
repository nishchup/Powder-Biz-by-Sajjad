import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { state } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === state.password) {
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-blue-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">App Locked</h2>
          <p className="text-slate-500 mt-2">Please enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="password" 
              autoFocus
              required
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-lg tracking-widest ${
                error ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-300'
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm font-semibold mt-2 flex items-center justify-center">
                <AlertCircle size={14} className="mr-1" /> Incorrect password
              </p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center"
          >
            <Unlock size={20} className="mr-2" />
            Unlock Application
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">PowderBiz Security</p>
        </div>
      </div>
    </div>
  );
};
