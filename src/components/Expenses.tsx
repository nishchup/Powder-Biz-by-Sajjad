import * as React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { Plus, Trash2, Pencil, X, Wallet, Printer, Search, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';
import { ConfirmModal } from './ConfirmModal';

export const Expenses: React.FC = () => {
  const { state, addExpense, editExpense, deleteExpense } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    category: '',
    amount: '',
    description: '',
  });

  const handleEdit = (e: any) => {
    setFormData({
      date: e.date,
      category: e.category,
      amount: e.amount.toString(),
      description: e.description,
    });
    setEditingId(e.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ date: getTodayDate(), category: '', amount: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (amount > 0 && formData.description && formData.category) {
      const data = {
        date: formData.date,
        category: formData.category,
        amount: amount,
        description: formData.description,
      };

      if (editingId) {
        editExpense(editingId, data);
      } else {
        addExpense(data);
      }
      
      handleCancel();
    }
  };

  const filteredExpenses = state.expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div 
      className="space-y-8" 
      id="expenses-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Expenses</h2>
          <p className="text-slate-500 font-medium">Track your operational and miscellaneous costs.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('expenses-content', 'expenses-report.pdf')}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print Report
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-rose-200 font-bold active:scale-95"
          >
            <Plus size={24} className="mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium text-slate-900 shadow-sm"
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
                    {editingId ? 'Edit Expense' : 'New Expense'}
                  </h3>
                  <p className="text-slate-500 font-medium">Enter expense details below</p>
                </div>
                <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="" disabled>Select a category</option>
                      {state.expenseCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {state.expenseCategories.length === 0 && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">Add categories in Contacts first</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount (৳)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Labor for drying batch #1"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4 pt-8 border-t border-slate-100">
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
                      {editingId ? 'Update Expense' : 'Save Expense'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      <div className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 flex items-center">
            <History className="mr-3 text-rose-500" size={24} />
            Expense History
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Records: {filteredExpenses.length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Wallet className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No expenses yet</p>
                      <p className="text-slate-400 font-medium mt-1">Start by adding your first business expense.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{e.date}</td>
                    <td className="px-8 py-5 text-sm">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{e.description}</td>
                    <td className="px-8 py-5 text-sm text-rose-600 font-black text-right">৳{(e.amount || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEdit(e)}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setItemToDelete(e.id);
                            setIsConfirmOpen(true);
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
        
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        onConfirm={() => itemToDelete && deleteExpense(itemToDelete)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};
