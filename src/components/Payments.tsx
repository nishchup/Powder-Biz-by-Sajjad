import * as React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { Plus, Trash2, CreditCard, ArrowDownCircle, ArrowUpCircle, HandCoins, Pencil, Printer, X, Search, ChevronLeft, ChevronRight, DollarSign, History } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';
import { ConfirmModal } from './ConfirmModal';

export const Payments: React.FC = () => {
  const { state, addSupplierPayment, editSupplierPayment, deleteSupplierPayment, addCustomerPayment, editCustomerPayment, deleteCustomerPayment, addLoan, editLoan, deleteLoan, addCompanyAdvance, editCompanyAdvance, deleteCompanyAdvance, addProfitWithdrawal, editProfitWithdrawal, deleteProfitWithdrawal } = useAppStore();
  const t = useTranslation(state.language);
  const [activeTab, setActiveTab] = useState<'supplier' | 'customer' | 'loan' | 'companyAdvance' | 'profitWithdraw'>('supplier');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    name: '',
    amount: '',
    description: '',
    notes: '',
  });

  const handleEdit = (p: any) => {
    setFormData({
      date: p.date,
      name: activeTab === 'supplier' ? p.supplierName : activeTab === 'customer' ? p.customerName : activeTab === 'loan' ? p.personName : activeTab === 'profitWithdraw' ? p.deliveryId : '',
      amount: p.amount.toString(),
      description: activeTab === 'profitWithdraw' ? p.notes : (p.description || p.remarks || ''),
      notes: p.notes || '',
    });
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ date: getTodayDate(), name: '', amount: '', description: '', notes: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (amount > 0) {
      if (activeTab === 'supplier' && formData.name) {
        if (editingId) {
          editSupplierPayment(editingId, { date: formData.date, supplierName: formData.name, amount, remarks: formData.description, notes: formData.notes });
        } else {
          addSupplierPayment({ date: formData.date, supplierName: formData.name, amount, remarks: formData.description, notes: formData.notes });
        }
        handleCancel();
      } else if (activeTab === 'customer' && formData.name) {
        if (editingId) {
          editCustomerPayment(editingId, { date: formData.date, customerName: formData.name, amount, notes: formData.notes });
        } else {
          addCustomerPayment({ date: formData.date, customerName: formData.name, amount, notes: formData.notes });
        }
        handleCancel();
      } else if (activeTab === 'loan' && formData.name) {
        if (editingId) {
          editLoan(editingId, { date: formData.date, personName: formData.name, amount, description: formData.description });
        } else {
          addLoan({ date: formData.date, personName: formData.name, amount, description: formData.description });
        }
        handleCancel();
      } else if (activeTab === 'companyAdvance') {
        if (editingId) {
          editCompanyAdvance(editingId, { date: formData.date, amount, description: formData.description });
        } else {
          addCompanyAdvance({ date: formData.date, amount, description: formData.description });
        }
        handleCancel();
      } else if (activeTab === 'profitWithdraw') {
        if (editingId) {
          editProfitWithdrawal(editingId, { date: formData.date, amount, deliveryId: formData.name, notes: formData.description });
        } else {
          addProfitWithdrawal({ date: formData.date, amount, deliveryId: formData.name, notes: formData.description });
        }
        handleCancel();
      }
    }
  };

  const getActiveData = () => {
    if (activeTab === 'supplier') return state.supplierPayments || [];
    if (activeTab === 'customer') return state.customerPayments || [];
    if (activeTab === 'companyAdvance') return state.companyAdvances || [];
    if (activeTab === 'profitWithdraw') return state.profitWithdrawals || [];
    return state.loans || [];
  };

  const activeData = getActiveData();
  
  const filteredData = activeData.filter((p: any) => {
    const name = activeTab === 'supplier' ? p.supplierName : activeTab === 'customer' ? p.customerName : activeTab === 'loan' ? p.personName : activeTab === 'profitWithdraw' ? p.deliveryId : '';
    const description = p.description || p.remarks || p.notes || '';
    return (name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           (description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div 
      className="space-y-8" 
      id="payments-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Adjustments</h2>
          <p className="text-slate-500 font-medium">Track all financial movements and ledger adjustments.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('payments-content', 'payments-report.pdf')}
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
            Add Payment
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-100 mb-8 scrollbar-hide bg-white/50 p-1 rounded-2xl print:hidden">
        {[
          { id: 'supplier', icon: ArrowUpCircle, label: 'Supplier (Out)' },
          { id: 'customer', icon: ArrowDownCircle, label: 'Customer (In)' },
          { id: 'loan', icon: HandCoins, label: 'Loans (Deduction)' },
          { id: 'companyAdvance', icon: CreditCard, label: 'Advance (In)' },
          { id: 'profitWithdraw', icon: DollarSign, label: 'Profit Withdraw' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); handleCancel(); setCurrentPage(1); }}
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

      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 shadow-sm"
          />
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div 
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingId ? 'Edit Payment' : 'New Payment'}
                  </h3>
                  <p className="text-slate-500 font-medium">Record a financial transaction</p>
                </div>
                <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                    {activeTab !== 'companyAdvance' && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          {activeTab === 'supplier' ? 'Supplier' : activeTab === 'customer' ? 'Customer' : activeTab === 'profitWithdraw' ? 'Delivery Reference' : 'Person Name'}
                        </label>
                        {activeTab === 'loan' ? (
                          <input 
                            type="text" 
                            required
                            placeholder="Enter name..."
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                          />
                        ) : activeTab === 'profitWithdraw' ? (
                          <select 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                          >
                            <option value="" disabled>Select Delivery</option>
                            {(state.productDeliveries || []).map(d => (
                              <option key={d.id} value={d.id}>
                                {d.date} - {d.description} (Profit: ৳{d.netProfit.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                          >
                            <option value="" disabled>Select {activeTab === 'supplier' ? 'Supplier' : 'Customer'}</option>
                            {activeTab === 'supplier' 
                              ? (state.suppliers || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                              : (state.customers || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                            }
                          </select>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount (৳)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">৳</span>
                        <input 
                          type="number" 
                          required
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                    </div>
                    {(activeTab === 'loan' || activeTab === 'companyAdvance' || activeTab === 'supplier' || activeTab === 'profitWithdraw' || activeTab === 'customer') && (
                      <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          Notes
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter notes..."
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                    )}
                    {(activeTab === 'loan' || activeTab === 'companyAdvance' || activeTab === 'supplier' || activeTab === 'profitWithdraw') && (
                      <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          {activeTab === 'supplier' ? 'Remarks' : activeTab === 'profitWithdraw' ? 'Delivery Notes' : 'Description'}
                        </label>
                        <input 
                          type="text" 
                          placeholder={activeTab === 'loan' ? "Loan details..." : activeTab === 'supplier' ? "Payment remarks..." : activeTab === 'profitWithdraw' ? "Withdrawal details..." : "Advance details..."}
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                    )}
                  </div>
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
                      {editingId ? 'Update Payment' : 'Save Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      <div className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 flex items-center uppercase tracking-tight">
            <History className="mr-3 text-indigo-500" size={24} />
            {activeTab} History
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total: {sortedData.length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                {(activeTab === 'supplier' || activeTab === 'customer') && <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Notes</th>}
                {activeTab !== 'companyAdvance' && (
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                    {activeTab === 'supplier' ? 'Supplier' : activeTab === 'customer' ? 'Customer' : activeTab === 'profitWithdraw' ? 'Delivery Ref' : 'Person'}
                  </th>
                )}
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                {(activeTab === 'loan' || activeTab === 'companyAdvance' || activeTab === 'supplier' || activeTab === 'profitWithdraw') && <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                  {activeTab === 'supplier' ? 'Remarks' : activeTab === 'profitWithdraw' ? 'Notes' : 'Description'}
                </th>}
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={(activeTab === 'loan' || activeTab === 'companyAdvance') ? (activeTab === 'companyAdvance' ? 4 : 5) : ((activeTab === 'supplier' || activeTab === 'customer') ? 5 : 4)} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <CreditCard className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No {activeTab}s recorded</p>
                      <p className="text-slate-400 font-medium mt-1">Start by adding your first transaction.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((p: any) => {
                  const isAdjusted = activeTab === 'supplier' && p.remarks && (p.remarks.includes('Adjusted from existing payments') || p.remarks.includes('Offset for adjustment'));
                  const rowColor = activeTab === 'supplier' 
                    ? (isAdjusted ? 'text-blue-600' : 'text-emerald-600')
                    : 'text-slate-900';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className={`px-8 py-5 text-sm font-bold ${activeTab === 'supplier' ? rowColor : 'text-slate-600'}`}>{p.date}</td>
                      {(activeTab === 'supplier' || activeTab === 'customer') && <td className={`px-8 py-5 text-sm font-medium ${activeTab === 'supplier' ? rowColor : 'text-slate-500'}`}>{p.notes || '—'}</td>}
                      {activeTab !== 'companyAdvance' && (
                        <td className={`px-8 py-5 text-sm font-black ${rowColor}`}>
                          {activeTab === 'supplier' ? p.supplierName : activeTab === 'customer' ? p.customerName : activeTab === 'profitWithdraw' ? ((state.productDeliveries || []).find(d => d.id === p.deliveryId)?.description || p.deliveryId) : p.personName}
                        </td>
                      )}
                      <td className="px-8 py-5 text-sm text-right">
                        <span className={`font-black ${rowColor}`}>৳{(p.amount || 0).toLocaleString()}</span>
                      </td>
                      {(activeTab === 'loan' || activeTab === 'companyAdvance' || activeTab === 'supplier' || activeTab === 'profitWithdraw') && <td className={`px-8 py-5 text-sm font-medium ${activeTab === 'supplier' ? rowColor : 'text-slate-500'}`}>
                        {activeTab === 'supplier' ? p.remarks : activeTab === 'profitWithdraw' ? p.notes : p.description}
                      </td>}
                      <td className="px-8 py-5 text-center print:hidden">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(p)}
                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setItemToDelete(p.id);
                              setIsConfirmOpen(true);
                            }}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={`Delete ${activeTab === 'supplier' ? 'Supplier Payment' : activeTab === 'customer' ? 'Customer Payment' : activeTab === 'loan' ? 'Loan' : activeTab === 'companyAdvance' ? 'Company Advance' : 'Profit Withdrawal'}`}
        message="Are you sure you want to delete this payment record? This action cannot be undone."
        onConfirm={() => {
          if (itemToDelete) {
            if (activeTab === 'supplier') deleteSupplierPayment(itemToDelete);
            else if (activeTab === 'customer') deleteCustomerPayment(itemToDelete);
            else if (activeTab === 'companyAdvance') deleteCompanyAdvance(itemToDelete);
            else if (activeTab === 'profitWithdraw') deleteProfitWithdrawal(itemToDelete);
            else deleteLoan(itemToDelete);
          }
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};
