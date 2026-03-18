/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Purchases } from './components/Purchases';
import { Conversions } from './components/Conversions';
import { Sales } from './components/Sales';
import { Expenses } from './components/Expenses';
import { Reports } from './components/Reports';
import { Contacts } from './components/Contacts';
import { Payments } from './components/Payments';
import { Notes } from './components/Notes';
import { ProductDelivery } from './components/ProductDelivery';
import { Tasks } from './components/Tasks';
import { LaborTracking } from './components/LaborTracking';
import { LockScreen } from './components/LockScreen';
import { Inventory } from './components/Inventory';
import { SupplierLedger } from './components/SupplierLedger';
import { CapitalTracking } from './components/CapitalTracking';
import { WeatherForecast } from './components/WeatherForecast';
import { WeatherBanner } from './components/WeatherBanner';
import { Reminders } from './components/Reminders';
import { Chatbot } from './components/Chatbot';
import { AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

import { useAppStore } from './store';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string } | null>(null);
  const { state, markReminderAsNotified } = useAppStore();

  // Check for existing session on mount
  React.useEffect(() => {
    const lastUnlock = localStorage.getItem('lastUnlockTime');
    if (lastUnlock) {
      const timeElapsed = Date.now() - parseInt(lastUnlock);
      const threeMinutes = 3 * 60 * 1000;
      if (timeElapsed < threeMinutes) {
        setIsLocked(false);
      }
    }
  }, []);

  // Notification Checker
  React.useEffect(() => {
    if (isLocked) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      // Use local date string YYYY-MM-DD
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;

      state.reminders.forEach(reminder => {
        if (!reminder.completed && !reminder.notified && reminder.date === currentDate && reminder.time <= currentTime) {
          setActiveNotification({ id: reminder.id, title: reminder.title });
          markReminderAsNotified(reminder.id);
          
          // Play a subtle sound if possible
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [state.reminders, isLocked, markReminderAsNotified]);

  const handleUnlock = () => {
    localStorage.setItem('lastUnlockTime', Date.now().toString());
    setIsLocked(false);
  };

  const handleLock = () => {
    localStorage.removeItem('lastUnlockTime');
    setIsLocked(true);
  };

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'contacts': return <Contacts />;
      case 'purchases': return <Purchases />;
      case 'drying': return <Conversions />;
      case 'sales': return <Sales />;
      case 'expenses': return <Expenses />;
      case 'labor': return <LaborTracking />;
      case 'payments': return <Payments />;
      case 'reports': return <Reports />;
      case 'capitalTracking': return <CapitalTracking />;
      case 'supplierLedger': return <SupplierLedger />;
      case 'productDelivery': return <ProductDelivery />;
      case 'tasks': return <Tasks />;
      case 'reminders': return <Reminders />;
      case 'notes': return <Notes />;
      case 'weather': return <WeatherForecast />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLock={handleLock}>
      <WeatherBanner />
      {renderContent()}
      {state.showChatbot && <Chatbot />}

      {/* In-App Notification Toast */}
      <AnimatePresence>
        {activeNotification && (
          <div className="fixed top-4 right-4 z-[100] w-full max-w-sm animate-in slide-in-from-right-8 duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Bell className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                  {state.language === 'en' ? 'Reminder' : 'রিমাইন্ডার'}
                </p>
                <p className="text-slate-800 font-semibold">{activeNotification.title}</p>
              </div>
              <button 
                onClick={() => setActiveNotification(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

