import * as React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Users, Tags, Database, Download, Upload, AlertTriangle, Settings, Printer, Shield, History, ChevronLeft, ChevronRight, CheckCircle2, Info, DollarSign } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from './ConfirmModal';

export const Contacts: React.FC = () => {
  const { 
    state, 
    addSupplier, addCustomer, addExpenseCategory, 
    editSupplier, editCustomer, editExpenseCategory,
    deleteSupplier, deleteCustomer, deleteExpenseCategory,
    setInitialCapital, setCompanyInfo, setAppPin, setLastBackupTime,
    resetState, importState, setShowChatbot
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers' | 'categories' | 'backup' | 'general'>('general');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'supplier' | 'customer' | 'category' } | null>(null);

  // Check for backup notification
  React.useEffect(() => {
    const checkBackup = () => {
      if (!state.lastBackupTime) return;
      
      const lastBackup = new Date(state.lastBackupTime).getTime();
      const now = new Date().getTime();
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      
      if (now - lastBackup > twelveHoursInMs) {
        showMessage("It's been over 12 hours since your last backup. Please download a backup to keep your data safe.", 'info');
      }
    };
    
    checkBackup();
    const interval = setInterval(checkBackup, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [state.lastBackupTime]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [companyData, setCompanyData] = useState(state.companyInfo);
  const [capitalData, setCapitalData] = useState(state.initialCapital.toString());
  const [pinData, setPinData] = useState(state.appPin);
  const [showChatbotData, setShowChatbotData] = useState(state.showChatbot);

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      phone: item.phone || '',
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      if (activeTab === 'suppliers') {
        const data = { name: formData.name, phone: formData.phone };
        editingId ? editSupplier(editingId, data) : addSupplier(data);
      } else if (activeTab === 'customers') {
        const data = { name: formData.name, phone: formData.phone };
        editingId ? editCustomer(editingId, data) : addCustomer(data);
      } else if (activeTab === 'categories') {
        const data = { name: formData.name };
        editingId ? editExpenseCategory(editingId, data) : addExpenseCategory(data);
      }
      handleCancel();
    }
  };

  const handleExport = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = `powderBiz-${dateStr}-${timeStr}.json`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setLastBackupTime(now.toISOString());
    showMessage("Backup downloaded successfully!", 'success');
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    if (type !== 'info') {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = event => {
      try {
        const newState = JSON.parse(event.target?.result as string);
        if (newState && typeof newState === 'object') {
          setImportData(newState);
        }
      } catch(err) {
        showMessage("Invalid backup file!", 'error');
        setImportData(null);
      }
    };
  };

  const handleSaveImport = () => {
    if (!importData) {
      showMessage("Please select a valid backup file first!", 'error');
      return;
    }

    try {
      importState({
        purchases: Array.isArray(importData.purchases) ? importData.purchases : [],
        expenses: Array.isArray(importData.expenses) ? importData.expenses : [],
        conversions: Array.isArray(importData.conversions) ? importData.conversions : [],
        sales: Array.isArray(importData.sales) ? importData.sales : [],
        suppliers: Array.isArray(importData.suppliers) ? importData.suppliers : [],
        customers: Array.isArray(importData.customers) ? importData.customers : [],
        expenseCategories: Array.isArray(importData.expenseCategories) ? importData.expenseCategories : state.expenseCategories,
        initialCapital: importData.initialCapital || 0,
        companyInfo: importData.companyInfo || state.companyInfo,
        supplierPayments: Array.isArray(importData.supplierPayments) ? importData.supplierPayments : [],
        customerPayments: Array.isArray(importData.customerPayments) ? importData.customerPayments : [],
        notes: Array.isArray(importData.notes) ? importData.notes : [],
        loans: Array.isArray(importData.loans) ? importData.loans : [],
        companyAdvances: Array.isArray(importData.companyAdvances) ? importData.companyAdvances : [],
        productDeliveries: Array.isArray(importData.productDeliveries) ? importData.productDeliveries : [],
        profitWithdrawals: Array.isArray(importData.profitWithdrawals) ? importData.profitWithdrawals : [],
        tasks: Array.isArray(importData.tasks) ? importData.tasks : [],
        laborRecords: Array.isArray(importData.laborRecords) ? importData.laborRecords : [],
        appPin: importData.appPin || '1234',
        lastBackupTime: importData.lastBackupTime || null,
        language: importData.language || 'en',
        weatherLocation: importData.weatherLocation || 'Jamalpur',
      });
      showMessage("Data imported successfully!", 'success');
      setImportData(null);
    } catch (err) {
      showMessage("Failed to import data!", 'error');
    }
  };

  const handleReset = () => {
    resetState();
    setIsResetConfirmOpen(false);
    showMessage("All data has been reset.", 'success');
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyInfo(companyData);
    setInitialCapital(parseFloat(capitalData) || 0);
    if (pinData.length === 4) {
      setAppPin(pinData);
    }
    setShowChatbot(showChatbotData);
    showMessage("Settings saved successfully!", 'success');
  };

  const currentList = activeTab === 'suppliers' ? state.suppliers : 
                      activeTab === 'customers' ? state.customers : 
                      state.expenseCategories;

  const getTabTitle = () => {
    if (activeTab === 'suppliers') return 'Supplier';
    if (activeTab === 'customers') return 'Customer';
    return 'Category';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-8 right-8 px-6 py-4 rounded-[1.5rem] shadow-2xl font-black z-[200] flex items-center gap-4 backdrop-blur-md ${
              message.type === 'success' ? 'bg-emerald-600/90 text-white' : 
              message.type === 'error' ? 'bg-rose-600/90 text-white' : 
              'bg-indigo-600/90 text-white'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 size={24} />}
            {message.type === 'error' && <AlertTriangle size={24} />}
            {message.type === 'info' && <Info size={24} />}
            <span className="tracking-tight">{message.text}</span>
            {message.type === 'info' && (
              <button 
                onClick={() => setMessage(null)}
                className="ml-4 bg-white/20 hover:bg-white/30 rounded-xl p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Settings & Contacts</h2>
          <p className="text-slate-500 font-medium">Manage your business profile, contacts, and data.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          {activeTab !== 'backup' && activeTab !== 'general' && (
            <>
              <button 
                onClick={() => exportToPDF('contacts-content', `${activeTab}-report.pdf`)}
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
              >
                <Printer size={20} className="mr-2" />
                Print
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-100 font-bold active:scale-95"
              >
                <Plus size={24} className="mr-2" />
                Add {getTabTitle()}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-100 mb-8 scrollbar-hide bg-white/50 p-1 rounded-2xl">
        {[
          { id: 'general', icon: Settings, label: 'General' },
          { id: 'suppliers', icon: Users, label: 'Suppliers' },
          { id: 'customers', icon: Users, label: 'Customers' },
          { id: 'categories', icon: Tags, label: 'Categories' },
          { id: 'backup', icon: Database, label: 'Backup' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); handleCancel(); }}
            className={`py-3 px-6 flex items-center font-black uppercase tracking-widest text-[10px] transition-all rounded-xl whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingId ? `Edit ${getTabTitle()}` : `New ${getTabTitle()}`}
                  </h3>
                  <p className="text-slate-500 font-medium">Enter details for this {getTabTitle().toLowerCase()}</p>
                </div>
                <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder={`Enter ${getTabTitle().toLowerCase()} name`}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  {activeTab !== 'categories' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 017XXXXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-slate-900 hover:bg-black text-white font-black px-10 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      {editingId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'general' && (
        <motion.div variants={item} className="glass-panel p-10 rounded-[2.5rem]">
          <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center">
            <Settings className="mr-4 text-indigo-500" size={28} />
            General Settings
          </h3>
          
          <form onSubmit={handleSaveGeneral} className="space-y-10 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <DollarSign className="mr-2 text-emerald-500" size={16} /> Financial Setup
                  </h4>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Initial Capital (মূলধন)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">৳</span>
                      <input 
                        type="number" 
                        value={capitalData}
                        onChange={e => setCapitalData(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-slate-900 text-lg"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1 mt-2">This amount will be added to your Inhand Cash.</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <Shield className="mr-2 text-indigo-500" size={16} /> Security Settings
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">App Lock PIN</label>
                      <input 
                        type="password" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={pinData}
                        onChange={e => setPinData(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono tracking-[0.5em] text-2xl text-slate-900"
                        placeholder="****"
                      />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1 mt-2">Set a 4-digit PIN to secure your application.</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={showChatbotData}
                            onChange={(e) => setShowChatbotData(e.target.checked)}
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors ${showChatbotData ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showChatbotData ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <div className="text-sm font-bold text-slate-700">Show AI Chatbot</div>
                      </label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1 mt-2">Toggle the floating AI assistant icon.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                  <Users className="mr-2 text-indigo-500" size={16} /> Company Information
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Company Name</label>
                    <input 
                      type="text" 
                      value={companyData.name || ''}
                      onChange={e => setCompanyData({...companyData, name: e.target.value})}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="e.g. PowderBiz"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Address</label>
                    <input 
                      type="text" 
                      value={companyData.address || ''}
                      onChange={e => setCompanyData({...companyData, address: e.target.value})}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="Company Address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Phone</label>
                      <input 
                        type="text" 
                        value={companyData.phone || ''}
                        onChange={e => setCompanyData({...companyData, phone: e.target.value})}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        value={companyData.email || ''}
                        onChange={e => setCompanyData({...companyData, email: e.target.value})}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleSaveGeneral}
                className="bg-slate-900 hover:bg-black text-white px-12 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
              >
                Save All Settings
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'backup' && (
        <motion.div variants={item} className="glass-panel p-10 rounded-[2.5rem]">
          <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center">
            <Database className="mr-4 text-indigo-500" size={28} />
            Data Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2rem]">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                  <Download size={18} className="mr-2" /> Export Data
                </h4>
                <p className="text-sm text-slate-500 font-medium mb-8">Download a complete backup of all your records as a secure JSON file.</p>
                <button 
                  onClick={handleExport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all w-full shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Download Backup
                </button>
              </div>

              <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center">
                  <Upload size={18} className="mr-2" /> Import Data
                </h4>
                <p className="text-sm text-slate-500 font-medium mb-8">Restore your records from a previously downloaded backup file.</p>
                <div className="space-y-6">
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportFile}
                    className="block w-full text-xs text-slate-400 font-black uppercase tracking-widest file:mr-6 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-slate-900 file:text-white hover:file:bg-black transition-all"
                  />
                  <button 
                    onClick={handleSaveImport}
                    disabled={!importData}
                    className={`px-8 py-4 rounded-2xl font-black transition-all w-full flex items-center justify-center ${
                      importData 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 active:scale-95' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={20} className="mr-2" /> Save Imported Data
                  </button>
                  {importData && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-center"
                    >
                      ✓ File ready to import. Click Save to apply.
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-rose-50/50 border border-rose-100 rounded-[2rem] flex flex-col justify-center">
              <div className="w-20 h-20 bg-rose-100 rounded-[1.5rem] flex items-center justify-center text-rose-600 mb-8">
                <AlertTriangle size={40} />
              </div>
              <h4 className="text-xl font-black text-rose-900 mb-4">Danger Zone</h4>
              <p className="text-sm text-rose-700 font-medium mb-10 leading-relaxed">
                This action will permanently delete all your purchases, sales, expenses, and contacts. This cannot be undone unless you have a backup.
              </p>
              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black transition-all w-full shadow-lg shadow-rose-100 active:scale-95"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[150] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center"
            >
              <div className="w-20 h-20 bg-rose-100 rounded-[1.5rem] flex items-center justify-center text-rose-600 mx-auto mb-8">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Confirm Reset</h3>
              <p className="text-slate-500 font-medium mb-10">
                Are you absolutely sure? This will delete ALL your data permanently. This action cannot be undone.
              </p>
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleReset}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                  Yes, Delete Everything
                </button>
                <button 
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab !== 'backup' && activeTab !== 'general' && (
        <motion.div variants={item} className="glass-panel rounded-[2rem] overflow-hidden" id="contacts-content">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 flex items-center uppercase tracking-tight">
              {activeTab === 'categories' ? <Tags className="mr-3 text-indigo-500" size={24} /> : <Users className="mr-3 text-indigo-500" size={24} />}
              {activeTab} List
            </h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total: {currentList.length}</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Name</th>
                  {activeTab !== 'categories' && <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Phone</th>}
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab !== 'categories' ? 3 : 2} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                          {activeTab === 'categories' ? <Tags className="text-slate-200" size={48} /> : <Users className="text-slate-200" size={48} />}
                        </div>
                        <p className="text-xl font-black text-slate-900">No {activeTab} yet</p>
                        <p className="text-slate-400 font-medium mt-1">Start by adding your first {getTabTitle().toLowerCase()}.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-sm font-black text-slate-900">{item.name}</td>
                      {activeTab !== 'categories' && <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.phone || '-'}</td>}
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if (activeTab === 'suppliers') setDeleteConfirm({ id: item.id, type: 'supplier' });
                              else if (activeTab === 'customers') setDeleteConfirm({ id: item.id, type: 'customer' });
                              else setDeleteConfirm({ id: item.id, type: 'category' });
                            }}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'supplier') deleteSupplier(deleteConfirm.id);
            if (deleteConfirm.type === 'customer') deleteCustomer(deleteConfirm.id);
            if (deleteConfirm.type === 'category') deleteExpenseCategory(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        title={`Delete ${deleteConfirm?.type === 'category' ? 'Category' : deleteConfirm?.type === 'supplier' ? 'Supplier' : 'Customer'}`}
        message={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
      />
    </motion.div>
  );
};
