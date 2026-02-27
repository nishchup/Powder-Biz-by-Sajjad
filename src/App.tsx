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

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'contacts': return <Contacts />;
      case 'purchases': return <Purchases />;
      case 'drying': return <Conversions />;
      case 'sales': return <Sales />;
      case 'expenses': return <Expenses />;
      case 'payments': return <Payments />;
      case 'reports': return <Reports />;
      case 'productDelivery': return <ProductDelivery />;
      case 'notes': return <Notes />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
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

