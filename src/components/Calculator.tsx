import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { X, Delete, History, Copy, Check, Percent, Divide, Minus, Plus, Equal, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
  }, []);

  const handleDelete = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  const handleNumber = useCallback((num: string) => {
    setDisplay(prev => {
      if (prev === '0' && num !== '.') return num;
      if (num === '.' && prev.includes('.')) return prev;
      return prev + num;
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    setEquation(prev => {
      const lastChar = prev.trim().slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar) && display === '0') {
        return prev.slice(0, -3) + ' ' + op + ' ';
      }
      return (prev === '' ? display : prev + display) + ' ' + op + ' ';
    });
    setDisplay('0');
  }, [display]);

  const calculate = useCallback(() => {
    try {
      const fullEquation = equation + display;
      if (!fullEquation || fullEquation === display) return;

      const evalStr = fullEquation.replace(/×/g, '*').replace(/÷/g, '/');
      const safeEval = new Function('return ' + evalStr);
      const result = safeEval();
      
      const formattedResult = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(8)).toString();
      
      setHistory(prev => [{ eq: fullEquation, res: formattedResult }, ...prev].slice(0, 10));
      setDisplay(formattedResult);
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  }, [equation, display]);

  const handlePercentage = useCallback(() => {
    setDisplay(prev => (parseFloat(prev) / 100).toString());
  }, []);

  const handleSqrt = useCallback(() => {
    setDisplay(prev => {
      const val = parseFloat(prev);
      if (val < 0) return 'Error';
      return Math.sqrt(val).toString();
    });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleNumber('.');
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('×');
      if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      }
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      }
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') {
        if (showHistory) setShowHistory(false);
        else onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, handleNumber, handleOperator, calculate, handleDelete, showHistory, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-24 right-4 sm:right-6 z-[100] bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 transition-all duration-300 ease-in-out overflow-hidden flex flex-col animate-in zoom-in-95 fade-in
        ${isMinimized ? 'w-48 h-14 rounded-full' : 'w-[calc(100%-2rem)] max-w-[320px] h-auto'}
      `}
    >
      {/* Header */}
      <div className={`p-4 sm:p-5 bg-slate-800/50 flex justify-between items-center border-b border-slate-800 transition-all ${isMinimized ? 'border-none h-full' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <h3 className="text-slate-300 font-black text-[10px] tracking-[0.2em] uppercase truncate">
            {isMinimized ? 'Calc' : 'Smart Calc v2'}
          </h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!isMinimized && (
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 sm:p-2 rounded-xl transition-all ${showHistory ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="History"
            >
              <History size={14} />
            </button>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Display Area */}
          <div className="p-5 sm:p-6 bg-slate-900 flex flex-col items-end justify-end h-28 sm:h-32 relative group">
            <div className="text-slate-500 text-[10px] sm:text-xs font-mono mb-1 h-4 overflow-hidden text-right w-full">
              {equation}
            </div>
            <div className="text-white text-4xl sm:text-5xl font-light tracking-tighter truncate w-full text-right">
              {display}
            </div>
            
            <button 
              onClick={copyToClipboard}
              className="absolute left-5 sm:left-6 bottom-5 sm:bottom-6 p-2 bg-slate-800 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-white"
              title="Copy Result"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>

          {/* History Overlay */}
          {showHistory && (
            <div className="absolute inset-x-0 top-[65px] sm:top-[73px] bottom-0 bg-slate-900 z-10 p-4 sm:p-5 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History</h4>
                <button onClick={() => setHistory([])} className="text-[10px] text-rose-500 font-bold hover:underline">Clear All</button>
              </div>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-600 text-sm italic">No history yet</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <div 
                      key={i} 
                      className="text-right border-b border-slate-800 pb-3 cursor-pointer hover:bg-slate-800/30 rounded-lg p-2 transition-colors"
                      onClick={() => {
                        setDisplay(item.res);
                        setShowHistory(false);
                      }}
                    >
                      <div className="text-slate-500 text-[10px] font-mono mb-1">{item.eq}</div>
                      <div className="text-white font-bold text-base sm:text-lg">={item.res}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Keypad */}
          <div className="p-3 sm:p-4 grid grid-cols-4 gap-1.5 sm:gap-2 bg-slate-900">
            {/* Row 1 */}
            <button onClick={handleClear} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white py-3.5 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs transition-all active:scale-95">AC</button>
            <button onClick={handleSqrt} className="bg-slate-800 text-slate-300 hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95 text-lg sm:text-xl font-bold">√</button>
            <button onClick={handlePercentage} className="bg-slate-800 text-slate-300 hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95"><Percent size={16} /></button>
            <button onClick={() => handleOperator('÷')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95"><Divide size={18} /></button>

            {/* Row 2 */}
            <button onClick={() => handleNumber('7')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">7</button>
            <button onClick={() => handleNumber('8')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">8</button>
            <button onClick={() => handleNumber('9')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">9</button>
            <button onClick={() => handleOperator('×')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">×</button>

            {/* Row 3 */}
            <button onClick={() => handleNumber('4')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">4</button>
            <button onClick={() => handleNumber('5')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">5</button>
            <button onClick={() => handleNumber('6')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">6</button>
            <button onClick={() => handleOperator('-')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95"><Minus size={18} /></button>

            {/* Row 4 */}
            <button onClick={() => handleNumber('1')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">1</button>
            <button onClick={() => handleNumber('2')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">2</button>
            <button onClick={() => handleNumber('3')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">3</button>
            <button onClick={() => handleOperator('+')} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95"><Plus size={18} /></button>

            {/* Row 5 */}
            <button onClick={() => handleNumber('0')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">0</button>
            <button onClick={() => handleNumber('.')} className="bg-slate-800 text-white hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-95">.</button>
            <button onClick={handleDelete} className="bg-slate-800 text-slate-400 hover:bg-slate-700 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95"><Delete size={18} /></button>
            <button onClick={calculate} className="bg-amber-500 text-white hover:bg-amber-600 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all active:scale-95"><Equal size={20} /></button>
          </div>
        </>
      )}
    </div>
  );
};
