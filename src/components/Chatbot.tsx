import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export const Chatbot: React.FC = () => {
  const { state } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: 'Hello! I am your PowderBiz AI assistant. How can I help you with your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBusinessContext = () => {
    const totalPurchases = state.purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalSales = state.sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalExpenses = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalLabor = state.laborRecords.reduce((sum, l) => sum + (l.totalCost || 0), 0);
    
    const wetStock = state.purchases.filter(p => p.type === 'wet').reduce((sum, p) => sum + p.quantity, 0) - 
                    state.conversions.reduce((sum, c) => sum + c.wetQuantityUsed, 0);
    
    const dryStock = state.conversions.reduce((sum, c) => sum + c.dryQuantityProduced, 0) - 
                    state.sales.reduce((sum, s) => sum + s.quantity, 0);

    return `
      Business Data Summary:
      - Total Purchases: ${totalPurchases} BDT
      - Total Sales: ${totalSales} BDT
      - Total Expenses: ${totalExpenses} BDT
      - Total Labor Cost: ${totalLabor} BDT
      - Current Wet Stock: ${wetStock} kg
      - Current Dry Stock: ${dryStock} kg
      - Number of Purchases: ${state.purchases.length}
      - Number of Sales: ${state.sales.length}
      - Number of Conversions: ${state.conversions.length}
      - Number of Suppliers: ${state.suppliers.length}
      - Number of Customers: ${state.customers.length}
      
      Recent Activity:
      - Last Purchase: ${state.purchases[0]?.date || 'None'}
      - Last Sale: ${state.sales[0]?.date || 'None'}
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const businessContext = generateBusinessContext();
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are a business consultant for a Wood Powder (Sawdust) production business in Bangladesh. 
              The user's language preference is ${state.language === 'bn' ? 'Bengali' : 'English'}.
              
              Context about the business:
              ${businessContext}
              
              User Question: ${userMessage}
              
              Please provide a helpful, data-driven response. If they ask in Bengali, reply in Bengali. Be professional and encouraging.`
            }]
          }
        ],
        config: {
          systemInstruction: "You are an expert business analyst for a sawdust production company. Use the provided data to give specific advice. Be concise but thorough."
        }
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-50 group"
      >
        <MessageSquare className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[70vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">PowderBiz AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] font-black uppercase tracking-widest">
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="prose prose-sm max-w-none prose-slate">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-xs font-bold text-slate-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your business..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1">
                  <TrendingUp size={10} />
                  <span>Analysis</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Insights</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>Advice</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Add AnimatePresence from framer-motion if not already imported in App.tsx
// I will check App.tsx imports.
