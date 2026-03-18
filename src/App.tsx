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
import { Chatbot } from './components/Chatbot';
import { AnimatePresence } from 'motion/react';

import { useAppStore } from './store';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const { state } = useAppStore();

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

