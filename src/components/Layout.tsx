import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Sun, TrendingUp, Wallet, BarChart3, Users, Menu, X, Truck, Package, CreditCard, Globe, StickyNote, Lock, Wifi, WifiOff, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { useTranslation } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLock: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLock }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { dryStock, state, setLanguage, isOnline, isSyncing, hasPendingSync, lastSynced, syncData } = useAppStore();
  const t = useTranslation(state.language);

  const formatLastSynced = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'inventory', label: t('inventory'), icon: Package, color: 'text-emerald-500' },
    { id: 'contacts', label: t('contactsSettings'), icon: Users, color: 'text-indigo-500' },
    { id: 'purchases', label: t('purchases'), icon: ShoppingCart, color: 'text-rose-500' },
    { id: 'drying', label: t('dryingProcess'), icon: Sun, color: 'text-amber-500' },
    { id: 'sales', label: t('sales'), icon: TrendingUp, color: 'text-green-500' },
    { id: 'expenses', label: t('expenses'), icon: Wallet, color: 'text-orange-500' },
    { id: 'labor', label: t('laborTracking'), icon: Clock, color: 'text-teal-500' },
    { id: 'payments', label: t('payments'), icon: CreditCard, color: 'text-cyan-500' },
    { id: 'reports', label: t('reports'), icon: BarChart3, color: 'text-violet-500' },
    { id: 'productDelivery', label: t('productDelivery'), icon: Truck, color: 'text-sky-500' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, color: 'text-pink-500' },
    { id: 'notes', label: t('notes'), icon: StickyNote, color: 'text-yellow-500' },
  ];

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 
        transform transition-transform duration-500 ease-in-out shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 flex flex-col print:hidden
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center text-white font-extrabold text-2xl tracking-tight">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-600/30">
              <Package className="text-white" size={24} />
            </div>
            {state.companyInfo.name}
          </div>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'hover:bg-slate-800/50 hover:text-white'}
                    `}
                  >
                    <Icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-white' : item.color + ' group-hover:scale-110'}`} />
                    <span className={`font-semibold text-sm tracking-wide ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">App Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`} />
                <span className="text-xs font-bold text-slate-300">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <button 
                onClick={onLock}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <Lock size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72 transition-all duration-500 print:pl-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between md:hidden print:hidden">
          <div className="flex items-center text-slate-900 font-extrabold text-lg shrink-0">
            <Package className="mr-2 text-blue-600" size={20} />
            <span className="truncate max-w-[150px]">{state.companyInfo.name}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-10 py-5 items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {navItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Manage your business operations efficiently</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${state.language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${state.language === 'bn' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                বাং
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2" />

            <button 
              onClick={syncData}
              disabled={isSyncing}
              className={`flex items-center text-xs font-bold px-4 py-2 rounded-xl border transition-all ${isSyncing ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
            >
              <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Synced ${formatLastSynced(lastSynced)}`}
            </button>

            <button 
              onClick={onLock}
              className="flex items-center text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              <Lock size={14} className="mr-2" />
              Lock App
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-10 print:overflow-visible print:bg-white print:p-0 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {dryStock >= 11500 && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between shadow-xl shadow-emerald-500/20 gap-4 print:hidden"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-md">
                        <Truck className="text-white animate-bounce" size={28} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl">Ready for Truck!</h3>
                        <p className="text-emerald-50/80 text-sm font-medium">Stock threshold reached for delivery</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sm">
                      Current: {dryStock.toFixed(2)} kg
                    </div>
                  </motion.div>
                )}
                
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
