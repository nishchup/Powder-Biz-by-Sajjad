import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Sun, TrendingUp, Wallet, BarChart3, Users, Menu, X, Truck, Package, CreditCard, Globe, StickyNote, Lock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';
import { useTranslation } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLock: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLock }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { dryStock, state, setLanguage, isOnline, isSyncing, lastSynced, syncData } = useAppStore();
  const t = useTranslation(state.language);

  const formatLastSynced = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'contacts', label: t('contactsSettings'), icon: Users },
    { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
    { id: 'drying', label: t('dryingProcess'), icon: Sun },
    { id: 'sales', label: t('sales'), icon: TrendingUp },
    { id: 'expenses', label: t('expenses'), icon: Wallet },
    { id: 'payments', label: t('payments'), icon: CreditCard },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'productDelivery', label: t('productDelivery'), icon: Truck },
    { id: 'notes', label: t('notes'), icon: StickyNote },
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 
        transform transition-transform duration-300 ease-in-out shadow-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 flex flex-col print:hidden
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center text-white font-bold text-xl tracking-tight">
            <Package className="mr-2 text-blue-500" />
            PowderBiz
          </div>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1.5 px-3">
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
                      w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                        : 'hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300 print:pl-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between md:hidden print:hidden">
          <div className="flex items-center text-slate-800 font-bold text-lg">
            <Package className="mr-2 text-blue-600" size={20} />
            PowderBiz
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {isOnline ? <Wifi size={12} className="mr-1" /> : <WifiOff size={12} className="mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {isOnline && isSyncing && (
              <RefreshCw size={16} className="text-blue-500 animate-spin" />
            )}
            <button 
              onClick={() => setLanguage(state.language === 'en' ? 'bn' : 'en')}
              className="flex items-center text-slate-600 hover:text-blue-600 font-medium text-sm bg-slate-100 px-2 py-1 rounded-md"
            >
              <Globe size={16} className="mr-1" />
              {state.language === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button 
              onClick={onLock}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Lock size={20} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-8 py-4 items-center justify-between print:hidden">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {navItems.find(item => item.id === activeTab)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 mr-2">
              <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {isOnline ? <Wifi size={14} className="mr-2" /> : <WifiOff size={14} className="mr-2" />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
              {isOnline && (
                <button 
                  onClick={syncData}
                  disabled={isSyncing}
                  className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 transition-colors ${isSyncing ? 'text-blue-400 border-blue-100' : 'text-slate-600 border-slate-200'}`}
                  title={`Last synced: ${formatLastSynced(lastSynced)}`}
                >
                  <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : `Synced ${formatLastSynced(lastSynced)}`}
                </button>
              )}
            </div>
            <button 
              onClick={() => setLanguage(state.language === 'en' ? 'bn' : 'en')}
              className="flex items-center text-slate-600 hover:text-blue-600 font-medium text-sm bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Globe size={18} className="mr-2" />
              {state.language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button 
              onClick={onLock}
              className="flex items-center text-slate-600 hover:text-red-600 font-medium text-sm bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              title="Lock Application"
            >
              <Lock size={18} className="mr-2" />
              Lock
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8 print:overflow-visible print:bg-white print:p-0">
          <div className="max-w-7xl mx-auto">
            {dryStock >= 11000 && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 px-4 py-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-emerald-200 gap-3 print:hidden">
                <div className="flex items-center font-bold text-lg">
                  <Truck className="mr-3 text-emerald-600 animate-bounce" size={24} />
                  Ready for Truck!
                </div>
                <div className="text-sm font-medium bg-emerald-100 px-3 py-1.5 rounded-full inline-block w-fit">
                  Current Dry Stock: {dryStock.toFixed(2)} kg (Min: 11,500 kg)
                </div>
              </div>
            )}
            
            {/* Content Container */}
            <div className="animate-in fade-in duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
