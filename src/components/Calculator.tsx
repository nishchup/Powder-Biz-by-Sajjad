import * as React from 'react';
import { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Replace × and ÷ with * and / for evaluation
      const evalStr = (equation + display).replace(/×/g, '*').replace(/÷/g, '/');
      
      // Safe evaluation using Function instead of eval
      const safeEval = new Function('return ' + evalStr);
      const result = safeEval();
      
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  return (
    <div className="fixed bottom-20 right-6 z-[100] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-72 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-200">
      <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
        <h3 className="text-white font-bold text-sm tracking-widest uppercase">Calculator</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-5 bg-slate-900 flex flex-col items-end justify-end h-24">
        <div className="text-slate-400 text-sm h-5 font-mono">{equation}</div>
        <div className="text-white text-4xl font-light tracking-tight truncate w-full text-right">{display}</div>
      </div>

      <div className="p-4 grid grid-cols-4 gap-2 bg-slate-800/50">
        <button onClick={handleClear} className="col-span-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 py-3 rounded-xl font-bold transition-colors">AC</button>
        <button onClick={handleDelete} className="bg-slate-700 text-slate-300 hover:bg-slate-600 py-3 rounded-xl flex items-center justify-center transition-colors"><Delete size={18} /></button>
        <button onClick={() => handleOperator('÷')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-3 rounded-xl font-bold text-lg transition-colors">÷</button>

        <button onClick={() => handleNumber('7')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">7</button>
        <button onClick={() => handleNumber('8')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">8</button>
        <button onClick={() => handleNumber('9')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">9</button>
        <button onClick={() => handleOperator('×')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-3 rounded-xl font-bold text-lg transition-colors">×</button>

        <button onClick={() => handleNumber('4')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">4</button>
        <button onClick={() => handleNumber('5')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">5</button>
        <button onClick={() => handleNumber('6')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">6</button>
        <button onClick={() => handleOperator('-')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-3 rounded-xl font-bold text-lg transition-colors">-</button>

        <button onClick={() => handleNumber('1')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">1</button>
        <button onClick={() => handleNumber('2')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">2</button>
        <button onClick={() => handleNumber('3')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">3</button>
        <button onClick={() => handleOperator('+')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-3 rounded-xl font-bold text-lg transition-colors">+</button>

        <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">0</button>
        <button onClick={() => handleNumber('.')} className="bg-slate-700 text-white hover:bg-slate-600 py-3 rounded-xl font-bold text-lg transition-colors">.</button>
        <button onClick={calculate} className="bg-amber-500 text-white hover:bg-amber-600 py-3 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-colors">=</button>
      </div>
    </div>
  );
};
