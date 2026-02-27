import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Users, Tags, Database, Download, Upload, AlertTriangle, Settings, Lock } from 'lucide-react';

export const Contacts: React.FC = () => {
  const { 
    state, 
    addSupplier, addCustomer, addExpenseCategory, 
    editSupplier, editCustomer, editExpenseCategory,
    deleteSupplier, deleteCustomer, deleteExpenseCategory,
    setInitialCapital, setCompanyInfo, updatePassword,
    resetState, importState
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers' | 'categories' | 'backup' | 'general'>('suppliers');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [importData, setImportData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [companyData, setCompanyData] = useState(state.companyInfo);
  const [capitalData, setCapitalData] = useState(state.initialCapital.toString());
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "powderbiz_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
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
        productDeliveries: Array.isArray(importData.productDeliveries) ? importData.productDeliveries : [],
        language: importData.language || 'en',
      });
      showMessage("Data imported successfully!", 'success');
      setImportData(null);
      // Reset file input if possible or just clear state
    } catch (err) {
      showMessage("Failed to import data!", 'error');
    }
  };

  const handleReset = () => {
    if (resetPassword === state.password) {
      resetState();
      setIsResetConfirmOpen(false);
      setResetPassword('');
      setResetError(false);
      showMessage("All data has been reset.", 'success');
    } else {
      setResetError(true);
      setTimeout(() => setResetError(false), 2000);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyInfo(companyData);
    setInitialCapital(parseFloat(capitalData) || 0);
    showMessage("Settings saved successfully!", 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.current !== state.password) {
      showMessage("Current password is incorrect!", 'error');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      showMessage("New passwords do not match!", 'error');
      return;
    }
    if (passwordData.new.length < 4) {
      showMessage("Password must be at least 4 characters!", 'error');
      return;
    }
    updatePassword(passwordData.new);
    setPasswordData({ current: '', new: '', confirm: '' });
    showMessage("Password updated successfully!", 'success');
  };

  const currentList = activeTab === 'suppliers' ? state.suppliers : 
                      activeTab === 'customers' ? state.customers : 
                      state.expenseCategories;

  const getTabTitle = () => {
    if (activeTab === 'suppliers') return 'Supplier';
    if (activeTab === 'customers') return 'Customer';
    return 'Category';
  };

  return (
    <div className="space-y-6 relative">
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg font-medium z-50 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message.text}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Settings & Contacts</h2>
        {!isFormOpen && activeTab !== 'backup' && activeTab !== 'general' && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            Add {getTabTitle()}
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 mb-6 scrollbar-hide">
        <button
          onClick={() => { setActiveTab('general'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'general' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={18} className="mr-2" />
          General Settings
        </button>
        <button
          onClick={() => { setActiveTab('suppliers'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'suppliers' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={18} className="mr-2" />
          Suppliers
        </button>
        <button
          onClick={() => { setActiveTab('customers'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'customers' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={18} className="mr-2" />
          Customers
        </button>
        <button
          onClick={() => { setActiveTab('categories'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'categories' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tags size={18} className="mr-2" />
          Expense Categories
        </button>
        <button
          onClick={() => { setActiveTab('backup'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'backup' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={18} className="mr-2" />
          Data Backup
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? `Edit ${getTabTitle()}` : `New ${getTabTitle()}`}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
              <input 
                type="text" 
                required
                placeholder={`Enter ${getTabTitle().toLowerCase()} name`}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {activeTab !== 'categories' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 017XXXXXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? `Update ${getTabTitle()}` : `Save ${getTabTitle()}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">General Settings</h3>
          
          <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-4">Financial Setup</h4>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Capital (মূলধন)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">৳</span>
                  <input 
                    type="number" 
                    value={capitalData}
                    onChange={e => setCapitalData(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter initial capital amount"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">This amount will be added to your Inhand Cash.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-4">Company Information</h4>
              <p className="text-sm text-slate-500 mb-4">This information will appear on your invoices and receipts.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                  <input 
                    type="text" 
                    value={companyData.name}
                    onChange={e => setCompanyData({...companyData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. PowderBiz"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                  <input 
                    type="text" 
                    value={companyData.address}
                    onChange={e => setCompanyData({...companyData, address: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Company Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input 
                    type="text" 
                    value={companyData.phone}
                    onChange={e => setCompanyData({...companyData, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={companyData.email}
                    onChange={e => setCompanyData({...companyData, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Email Address"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Lock className="mr-2 text-blue-600" size={20} /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.current}
                  onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.new}
                  onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.confirm}
                  onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Database className="mr-2 text-blue-600" /> Data Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Download size={18} className="mr-2" /> Export Data
                </h4>
                <p className="text-sm text-blue-700 mb-4">Download a complete backup of all your records (purchases, sales, contacts, etc.) as a JSON file.</p>
                <button 
                  onClick={handleExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                  Download Backup
                </button>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                  <Upload size={18} className="mr-2" /> Import Data
                </h4>
                <p className="text-sm text-slate-600 mb-4">Restore your records from a previously downloaded JSON backup file.</p>
                <div className="space-y-3">
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportFile}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                  />
                  <button 
                    onClick={handleSaveImport}
                    disabled={!importData}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto flex items-center justify-center ${
                      importData 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={18} className="mr-2" /> Save Imported Data
                  </button>
                  {importData && (
                    <p className="text-xs text-green-600 font-medium">✓ File ready to import. Click "Save" to apply.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-red-50 border border-red-100 rounded-xl flex flex-col justify-center">
              <div className="flex items-center text-red-700 font-bold text-lg mb-2">
                <AlertTriangle className="mr-2" size={24} /> Danger Zone
              </div>
              <p className="text-sm text-red-600 mb-6">
                This action will permanently delete all your purchases, sales, expenses, and contacts. This cannot be undone unless you have a backup.
              </p>
              <button 
                onClick={() => setIsResetConfirmOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition-colors w-full"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle size={32} className="mr-3" />
              <h3 className="text-xl font-bold">Confirm Reset</h3>
            </div>
            <p className="text-slate-600 mb-6">
              WARNING: This will delete ALL your data permanently. This action cannot be undone unless you have a backup.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Enter Password to Confirm</label>
              <input 
                type="password" 
                placeholder="Enter app password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all ${
                  resetError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {resetError && <p className="text-red-600 text-xs font-bold mt-1">Incorrect password!</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'backup' && activeTab !== 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  {activeTab !== 'categories' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab !== 'categories' ? 3 : 2} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        {activeTab === 'categories' ? <Tags className="text-slate-300 mb-3" size={48} /> : <Users className="text-slate-300 mb-3" size={48} />}
                        <p className="text-base font-medium">No {activeTab} added yet.</p>
                        <p className="text-sm mt-1">Click "Add {getTabTitle()}" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{item.name}</td>
                      {activeTab !== 'categories' && <td className="px-6 py-4 text-sm text-slate-700">{item.phone || '-'}</td>}
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if (activeTab === 'suppliers') deleteSupplier(item.id);
                              else if (activeTab === 'customers') deleteCustomer(item.id);
                              else deleteExpenseCategory(item.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
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
        </div>
      )}
    </div>
  );
};
