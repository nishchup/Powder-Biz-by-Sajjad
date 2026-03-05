import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Receipt, Printer, TrendingUp, Share2, Download, Search, ChevronLeft, ChevronRight, Sun, AlertCircle } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { motion, AnimatePresence } from 'framer-motion';

export const Sales: React.FC = () => {
  const { state, addSale, editSale, deleteSale, dryStock } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    quantity: '',
    pricePerKg: '',
    paidAmount: '',
    discount: '',
  });

  const handleEdit = (s: any) => {
    setFormData({
      date: s.date,
      customerName: s.customerName,
      quantity: s.quantity.toString(),
      pricePerKg: s.pricePerKg.toString(),
      paidAmount: s.paidAmount !== undefined ? s.paidAmount.toString() : s.totalRevenue.toString(),
      discount: s.discount !== undefined ? s.discount.toString() : '',
    });
    setEditingId(s.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setError(null);
    setFormData({ date: new Date().toISOString().split('T')[0], customerName: '', quantity: '', pricePerKg: '', paidAmount: '', discount: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.pricePerKg);
    const discount = parseFloat(formData.discount) || 0;
    const totalRevenue = (qty * price) - discount;
    const paid = formData.paidAmount === '' ? totalRevenue : parseFloat(formData.paidAmount);
    
    if (qty > 0 && price > 0 && formData.customerName) {
      const oldQty = editingId ? (state.sales.find(s => s.id === editingId)?.quantity || 0) : 0;
      const availableStock = dryStock + oldQty;

      if (qty > availableStock) {
        setError(`Not enough dry stock! Available: ${availableStock.toFixed(2)} kg`);
        return;
      }

      setError(null);
      const data = {
        date: formData.date,
        customerName: formData.customerName,
        quantity: qty,
        pricePerKg: price,
        totalRevenue: totalRevenue,
        paidAmount: paid,
        discount: discount,
      };

      if (editingId) {
        editSale(editingId, data);
      } else {
        addSale(data);
      }
      
      handleCancel();
    }
  };

  const handleShareWhatsApp = (challan: any) => {
    const text = `*${state.companyInfo.name}*\n_Sales Challan / Invoice_\n\n*Date:* ${challan.date}\n*Challan #:* ${challan.id.slice(0,8).toUpperCase()}\n*Billed To:* ${challan.customerName}\n\n*Description:* Dry Powder\n*Quantity:* ${challan.quantity.toFixed(2)} kg\n*Rate:* ৳${challan.pricePerKg.toFixed(2)}\n\n*Subtotal:* ৳${challan.totalRevenue.toLocaleString()}\n*Paid Amount:* ৳${(challan.paidAmount !== undefined ? challan.paidAmount : challan.totalRevenue).toLocaleString()}\n*Due Amount:* ৳${(challan.totalRevenue - (challan.paidAmount !== undefined ? challan.paidAmount : challan.totalRevenue)).toLocaleString()}\n\n*Total:* ৳${challan.totalRevenue.toLocaleString()}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredSales = state.sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSales = [...filteredSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      className="space-y-8" 
      id="sales-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sales</h2>
          <p className="text-slate-500 font-medium">Manage your dry powder sales and invoices.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('sales-content', 'sales-report.pdf')}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Download size={20} className="mr-2" />
            Download PDF
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-200 font-bold active:scale-95"
          >
            <Plus size={24} className="mr-2" />
            Add Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group bg-amber-50/50 border-amber-100">
          <div className="w-20 h-20 bg-amber-100 rounded-[1.5rem] flex items-center justify-center text-amber-600 mr-8 group-hover:scale-110 transition-transform">
            <Sun size={40} />
          </div>
          <div>
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Available Dry Stock</p>
            <p className="text-4xl font-black text-amber-900">
              {(dryStock || 0).toFixed(2)} <span className="text-xl font-bold text-amber-400">kg</span>
            </p>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="flex flex-col justify-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-900 shadow-sm"
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingId ? 'Edit Sale' : 'New Sale'}
                  </h3>
                  <p className="text-slate-500 font-medium">Stock available: {dryStock.toFixed(2)} kg</p>
                </div>
                <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl text-sm font-bold flex items-center"
                  >
                    <AlertCircle className="mr-3 shrink-0" size={20} />
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Customer</label>
                    <select 
                      required
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="" disabled>Select a customer</option>
                      {state.customers.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {state.customers.length === 0 && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">Add customer in Contacts first</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (kg)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Price per kg (৳)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.pricePerKg}
                      onChange={e => setFormData({...formData, pricePerKg: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Discount (৳)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.discount}
                      onChange={e => setFormData({...formData, discount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Paid Amount (৳)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Full payment if empty"
                      value={formData.paidAmount}
                      onChange={e => setFormData({...formData, paidAmount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Revenue</p>
                      <p className="text-2xl font-black text-emerald-700">
                        ৳{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.pricePerKg) || 0) - (parseFloat(formData.discount) || 0)).toLocaleString()}
                      </p>
                    </div>
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      {editingId ? 'Update Sale' : 'Save Sale'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Qty (kg)</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Paid</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Due</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No sales yet</p>
                      <p className="text-slate-400 font-medium mt-1">Start by adding your first powder sale.</p>
                      <button 
                        onClick={() => setIsFormOpen(true)}
                        className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        Add Sale Now
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{s.date}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 font-black">{s.customerName}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 text-right font-black">{(s.quantity || 0).toFixed(2)}</td>
                    <td className="px-8 py-5 text-sm text-emerald-600 text-right font-black">৳{(s.totalRevenue || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-emerald-600 text-right font-black">৳{(s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue).toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-rose-500 text-right font-black">
                      {s.totalRevenue - (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue) > 0 
                        ? `৳${(s.totalRevenue - (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue)).toLocaleString()}`
                        : '—'
                      }
                    </td>
                    <td className="px-8 py-5 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => setSelectedChallan(s)}
                          className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center active:scale-90"
                          title="Print Challan"
                        >
                          <Receipt size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(s)}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteSale(s.id)}
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
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
      </motion.div>

      {/* Challan Modal */}
      <AnimatePresence>
        {selectedChallan && (
          <div className="fixed inset-0 z-[110] bg-slate-900/60 flex items-start justify-center p-4 sm:p-8 overflow-y-auto backdrop-blur-md print-modal-container">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-12 relative print-modal-content" 
              id="challan-content"
            >
              <div className="print:hidden absolute top-8 right-8 flex space-x-3">
                <button 
                  onClick={() => handleShareWhatsApp(selectedChallan)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl flex items-center font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <Share2 size={18} className="mr-2"/> Share
                </button>
                <button 
                  onClick={() => exportToPDF('challan-content', `sales-challan-${selectedChallan.id.substring(0, 8)}.pdf`)} 
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl flex items-center font-bold transition-all shadow-lg active:scale-95"
                >
                  <Download size={18} className="mr-2"/> PDF
                </button>
                <button 
                  onClick={() => setSelectedChallan(null)} 
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center active:scale-90"
                >
                  <X size={24}/>
                </button>
              </div>
              
              <div className="text-center mb-12 border-b-4 border-slate-900 pb-8">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{state.companyInfo.name}</h1>
                <p className="text-slate-500 font-bold">{state.companyInfo.address}</p>
                <p className="text-slate-500 font-bold">Phone: {state.companyInfo.phone} | Email: {state.companyInfo.email}</p>
                <div className="mt-6 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full">
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Sales Challan / Invoice</span>
                </div>
              </div>
              
              <div className="flex justify-between mb-12">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billed To:</p>
                  <p className="font-black text-slate-900 text-2xl">{selectedChallan.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invoice Info</p>
                  <p className="font-black text-slate-900">Date: {selectedChallan.date}</p>
                  <p className="font-black text-emerald-600">#CH-{selectedChallan.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              
              <table className="w-full text-left border-collapse mb-12">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                    <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                    <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-6 font-bold text-slate-900">Dry Powder</td>
                    <td className="py-6 text-right font-bold text-slate-900">{selectedChallan.quantity.toFixed(2)} kg</td>
                    <td className="py-6 text-right font-bold text-slate-900">৳{selectedChallan.pricePerKg.toFixed(2)}</td>
                    <td className="py-6 text-right font-black text-slate-900 text-lg">৳{selectedChallan.totalRevenue.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="flex justify-end mb-16">
                <div className="w-72 space-y-4">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Subtotal:</span>
                    <span>৳{(selectedChallan.quantity * selectedChallan.pricePerKg).toLocaleString()}</span>
                  </div>
                  {selectedChallan.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>Discount:</span>
                      <span>- ৳{selectedChallan.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-600 font-black">
                    <span>Paid Amount:</span>
                    <span>৳{(selectedChallan.paidAmount !== undefined ? selectedChallan.paidAmount : selectedChallan.totalRevenue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-black">
                    <span>Due Amount:</span>
                    <span>৳{(selectedChallan.totalRevenue - (selectedChallan.paidAmount !== undefined ? selectedChallan.paidAmount : selectedChallan.totalRevenue)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-black text-slate-900 border-t-4 border-slate-900 pt-4">
                    <span>Total:</span>
                    <span>৳{selectedChallan.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-32">
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-200 mb-3"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Sign</p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-200 mb-3"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Authorized Sign</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
