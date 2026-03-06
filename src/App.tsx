/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(true);

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
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
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLock={() => setIsLocked(true)}>
      {renderContent()}
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

