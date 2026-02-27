import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, CreditCard, ArrowDownCircle, ArrowUpCircle, HandCoins, Pencil, Printer } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';

export const Payments: React.FC = () => {
  const { state, addSupplierPayment, editSupplierPayment, deleteSupplierPayment, addCustomerPayment, editCustomerPayment, deleteCustomerPayment, addLoan, editLoan, deleteLoan } = useAppStore();
  const t = useTranslation(state.language);
  const [activeTab, setActiveTab] = useState<'supplier' | 'customer' | 'loan'>('supplier');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: '',
    description: '',
  });

  const handleEdit = (p: any) => {
    setFormData({
      date: p.date,
      name: activeTab === 'supplier' ? p.supplierName : activeTab === 'customer' ? p.customerName : p.personName,
      amount: p.amount.toString(),
      description: p.description || '',
    });
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ date: new Date().toISOString().split('T')[0], name: '', amount: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (amount > 0) {
      if (activeTab === 'supplier' && formData.name) {
        if (editingId) {
          editSupplierPayment(editingId, { date: formData.date, supplierName: formData.name, amount });
        } else {
          addSupplierPayment({ date: formData.date, supplierName: formData.name, amount });
        }
        handleCancel();
      } else if (activeTab === 'customer' && formData.name) {
        if (editingId) {
          editCustomerPayment(editingId, { date: formData.date, customerName: formData.name, amount });
        } else {
          addCustomerPayment({ date: formData.date, customerName: formData.name, amount });
        }
        handleCancel();
      } else if (activeTab === 'loan' && formData.name) {
        if (editingId) {
          editLoan(editingId, { date: formData.date, personName: formData.name, amount, description: formData.description });
        } else {
          addLoan({ date: formData.date, personName: formData.name, amount, description: formData.description });
        }
        handleCancel();
      }
    }
  };

  return (
    <div className="space-y-6" id="payments-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('payments')} & Adjustments</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('payments-content', 'payments-report.pdf')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
          >
            <Printer size={18} className="mr-2" />
            {t('print')}
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
            >
              <Plus size={20} className="mr-2" />
              {t('addPayment') || 'Add Payment'}
            </button>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 mb-6 scrollbar-hide print:hidden">
        <button
          onClick={() => { setActiveTab('supplier'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'supplier' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpCircle size={18} className="mr-2" />
          {t('supplier')} {t('payments')} (Out)
        </button>
        <button
          onClick={() => { setActiveTab('customer'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'customer' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownCircle size={18} className="mr-2" />
          {t('customer')} {t('payments')} (In)
        </button>
        <button
          onClick={() => { setActiveTab('loan'); handleCancel(); }}
          className={`pb-3 px-5 flex items-center font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'loan' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HandCoins size={18} className="mr-2" />
          {t('loans')} (Deduction)
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-5">
            {editingId 
              ? `${t('editNote').replace('Note', 'Payment')} (${activeTab === 'supplier' ? t('supplier') : activeTab === 'customer' ? t('customer') : t('loans')})`
              : activeTab === 'supplier' ? `${t('addPayment')} (${t('supplier')})` : activeTab === 'customer' ? `${t('addPayment')} (${t('customer')})` : t('addLoan')
            }
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('date')}</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {activeTab === 'supplier' ? t('supplier') : activeTab === 'customer' ? t('customer') : t('personName')}
              </label>
              {activeTab === 'loan' ? (
                <input 
                  type="text" 
                  required
                  placeholder="Enter name..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <select 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>Select {activeTab === 'supplier' ? t('supplier') : t('customer')}</option>
                  {activeTab === 'supplier' 
                    ? state.suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                    : state.customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                  }
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('amount')} (৳)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            {activeTab === 'loan' && (
              <div className="sm:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('description')}</label>
                <input 
                  type="text" 
                  placeholder="Loan details..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            )}
            <div className="sm:col-span-3 flex justify-end space-x-3 mt-2 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {t('save') || 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'supplier' ? t('supplier') : activeTab === 'customer' ? t('customer') : t('personName')}
                </th>
                {activeTab === 'loan' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('description')}</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('amount')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'supplier' ? state.supplierPayments : activeTab === 'customer' ? state.customerPayments : state.loans).length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'loan' ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No {activeTab}s recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (activeTab === 'supplier' ? state.supplierPayments : activeTab === 'customer' ? state.customerPayments : state.loans).map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-700">{p.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                      {activeTab === 'supplier' ? p.supplierName : activeTab === 'customer' ? p.customerName : p.personName}
                    </td>
                    {activeTab === 'loan' && <td className="px-6 py-4 text-sm text-slate-600">{p.description}</td>}
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold">৳{(p.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-center print:hidden">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (activeTab === 'supplier') deleteSupplierPayment(p.id);
                            else if (activeTab === 'customer') deleteCustomerPayment(p.id);
                            else deleteLoan(p.id);
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
    </div>
  );
};
