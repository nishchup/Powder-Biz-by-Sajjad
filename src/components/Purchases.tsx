import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, ShoppingCart, Receipt, Printer, Share2, Filter, Search, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';

export const Purchases: React.FC = () => {
  const { state, addPurchase, editPurchase, deletePurchase, addSupplierPayment } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isPayDueOpen, setIsPayDueOpen] = useState(false);
  const [selectedPurchaseForDue, setSelectedPurchaseForDue] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const [duePaymentData, setDuePaymentData] = useState({
    amount: 0,
    remarks: '',
    adjustFromAdvance: false
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    quantity: '',
    pricePerKg: '',
    paidAmount: '',
    discount: '',
    type: 'wet' as 'wet' | 'dry',
    totalBags: '',
  });

  const getSupplierAdvance = (supplierName: string) => {
    const totalPurchases = state.purchases
      .filter(p => p.supplierName === supplierName)
      .reduce((sum, p) => sum + (p.totalCost || 0), 0);
    
    const totalPaidInPurchases = state.purchases
      .filter(p => p.supplierName === supplierName)
      .reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
    
    const totalSupplierPayments = state.supplierPayments
      .filter(p => p.supplierName === supplierName)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const balance = (totalPaidInPurchases + totalSupplierPayments) - totalPurchases;
    return balance > 0 ? balance : 0;
  };

  const handlePayDue = (p: any) => {
    const due = p.totalCost - (p.paidAmount !== undefined ? p.paidAmount : p.totalCost);
    setSelectedPurchaseForDue(p);
    setDuePaymentData({
      amount: due,
      remarks: '',
      adjustFromAdvance: false
    });
    setIsPayDueOpen(true);
  };

  const submitDuePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseForDue) return;

    const amount = duePaymentData.amount;
    const isAdjust = duePaymentData.adjustFromAdvance;

    // Update the purchase paid amount
    const updatedPurchase = {
      ...selectedPurchaseForDue,
      paidAmount: (selectedPurchaseForDue.paidAmount || 0) + amount
    };
    const { id, ...purchaseData } = updatedPurchase;
    editPurchase(id, purchaseData);

    // If not adjusting from advance, add a payment record
    if (!isAdjust) {
      addSupplierPayment({
        date: new Date().toISOString().split('T')[0],
        supplierName: selectedPurchaseForDue.supplierName,
        amount: amount,
        remarks: duePaymentData.remarks || `Due payment for purchase PR-${selectedPurchaseForDue.id.substring(0, 6).toUpperCase()}`
      });
    } else {
      // If adjusting from advance, we also need to record it as a payment with negative or special remark?
      // Actually, the user said: "যদি ঐ supplier এর কোনো advance থাকে তাহলে সেখানে due paid এর পর তার advance থেকে বিয়োগ হয়ে দেখাবে যা payment এর advance ও adjust হবে।"
      // This means we should record a payment that "uses" the advance.
      // In this system, "Advance" is just the surplus of payments.
      // If we adjust from advance, we are essentially saying "use the existing surplus to pay this due".
      // So we don't need to add a NEW SupplierPayment record because that would increase the total paid even more.
      // We just update the purchase's paidAmount.
      // However, to track this "adjustment", maybe we should add a 0-amount payment with remarks?
      // Or just a remark in the purchase.
      addSupplierPayment({
        date: new Date().toISOString().split('T')[0],
        supplierName: selectedPurchaseForDue.supplierName,
        amount: 0, // 0 because it's already paid as advance
        remarks: `Adjusted ৳${amount} from advance for PR-${selectedPurchaseForDue.id.substring(0, 6).toUpperCase()}. ${duePaymentData.remarks}`
      });
    }

    setIsPayDueOpen(false);
    setSelectedPurchaseForDue(null);
  };

  const handleEdit = (p: any) => {
    setFormData({
      date: p.date,
      supplierName: p.supplierName,
      quantity: p.quantity.toString(),
      pricePerKg: p.pricePerKg.toString(),
      paidAmount: p.paidAmount !== undefined ? p.paidAmount.toString() : p.totalCost.toString(),
      discount: p.discount !== undefined ? p.discount.toString() : '',
      type: p.type || 'wet',
      totalBags: p.totalBags !== undefined ? p.totalBags.toString() : '',
    });
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      supplierName: '', 
      quantity: '', 
      pricePerKg: '', 
      paidAmount: '',
      discount: '',
      type: 'wet',
      totalBags: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.pricePerKg);
    const discount = parseFloat(formData.discount) || 0;
    const totalCost = (qty * price) - discount;
    const paid = formData.paidAmount === '' ? totalCost : parseFloat(formData.paidAmount);
    const bags = formData.totalBags === '' ? undefined : parseInt(formData.totalBags, 10);
    
    if (qty > 0 && price > 0 && formData.supplierName) {
      const data = {
        date: formData.date,
        supplierName: formData.supplierName,
        quantity: qty,
        pricePerKg: price,
        totalCost: totalCost,
        paidAmount: paid,
        discount: discount,
        type: formData.type,
        totalBags: bags,
      };

      if (editingId) {
        editPurchase(editingId, data);
      } else {
        addPurchase(data);
      }
      
      handleCancel();
    }
  };

  const handleShareWhatsApp = (receipt: any) => {
    const typeLabel = receipt.type === 'dry' ? 'Dry Powder' : 'Wet Powder';
    const text = `*${state.companyInfo.name}*\n_Purchase Receipt_\n\n*Date:* ${receipt.date}\n*Receipt #:* PR-${receipt.id.substring(0, 6).toUpperCase()}\n*Supplier:* ${receipt.supplierName}\n\n*Description:* ${typeLabel}\n*Quantity:* ${receipt.quantity.toFixed(2)} kg\n*Rate:* ৳${receipt.pricePerKg.toFixed(2)}\n\n*Subtotal:* ৳${receipt.totalCost.toLocaleString()}\n*Paid Amount:* ৳${(receipt.paidAmount !== undefined ? receipt.paidAmount : receipt.totalCost).toLocaleString()}\n*Due Amount:* ৳${(receipt.totalCost - (receipt.paidAmount !== undefined ? receipt.paidAmount : receipt.totalCost)).toLocaleString()}\n\n*Total:* ৳${receipt.totalCost.toLocaleString()}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredPurchases = state.purchases.filter(p => 
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPurchases = [...filteredPurchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedPurchases.length / itemsPerPage);
  const paginatedPurchases = sortedPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      id="purchases-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchases</h2>
          <p className="text-slate-500 font-medium">Manage your raw material acquisitions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('purchases-content', 'purchases-report.pdf')}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print Report
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-200 font-bold active:scale-95"
          >
            <Plus size={24} className="mr-2" />
            Add Purchase
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center text-slate-500 font-bold">
          <Filter size={20} className="mr-2" />
          <span className="text-sm uppercase tracking-widest">Filters</span>
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
                    {editingId ? 'Edit Purchase' : 'New Purchase'}
                  </h3>
                  <p className="text-slate-500 font-medium">Enter transaction details below</p>
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Supplier</label>
                    <select 
                      required
                      value={formData.supplierName}
                      onChange={e => setFormData({...formData, supplierName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="" disabled>Select a supplier</option>
                      {state.suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    {state.suppliers.length === 0 && (
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">Add supplier in Contacts first</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Powder Type</label>
                    <select 
                      required
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as 'wet' | 'dry'})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="wet">Wet Powder</option>
                      <option value="dry">Dry Powder</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Bags</label>
                    <input 
                      type="number" 
                      min="1"
                      step="1"
                      placeholder="0"
                      value={formData.totalBags}
                      onChange={e => setFormData({...formData, totalBags: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className="text-2xl font-black text-blue-700">
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
                      className="bg-slate-900 hover:bg-black text-white font-black px-10 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      {editingId ? 'Update Purchase' : 'Save Purchase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      <div className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Bags</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Qty (kg)</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Cost</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Paid</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Due</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No purchases yet</p>
                      <p className="text-slate-400 font-medium mt-1">Start by adding your first raw material purchase.</p>
                      <button 
                        onClick={() => setIsFormOpen(true)}
                        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        Add Purchase Now
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{p.date}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 font-black">{p.supplierName}</td>
                    <td className="px-8 py-5 text-sm">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.type === 'dry' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.type === 'dry' ? 'Dry' : 'Wet'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-700 text-right font-bold">{p.totalBags || '-'}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 text-right font-black">{(p.quantity || 0).toFixed(2)}</td>
                    <td className="px-8 py-5 text-sm text-slate-900 text-right font-black">৳{(p.totalCost || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-emerald-600 text-right font-black">৳{(p.paidAmount !== undefined ? p.paidAmount : p.totalCost).toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-rose-500 text-right font-black">
                      {p.totalCost - (p.paidAmount !== undefined ? p.paidAmount : p.totalCost) > 0 
                        ? (
                          <div className="flex flex-col items-end">
                            <span>৳{(p.totalCost - (p.paidAmount !== undefined ? p.paidAmount : p.totalCost)).toLocaleString()}</span>
                            <button 
                              onClick={() => handlePayDue(p)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-black uppercase tracking-tighter mt-1 flex items-center"
                            >
                              <Wallet size={10} className="mr-1" />
                              Payable Due
                            </button>
                          </div>
                        )
                        : '—'
                      }
                    </td>
                    <td className="px-8 py-5 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => setSelectedReceipt(p)}
                          className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center active:scale-90"
                          title="Receipt"
                        >
                          <Receipt size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(p)}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deletePurchase(p.id)}
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
      </div>

      {/* Due Payment Modal */}
      {isPayDueOpen && selectedPurchaseForDue && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[120] p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Pay Due Amount</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">PR-{selectedPurchaseForDue.id.substring(0, 6).toUpperCase()}</p>
              </div>
              <button onClick={() => setIsPayDueOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitDuePayment} className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Supplier Advance</p>
                  <p className="text-lg font-black text-blue-700">৳{getSupplierAdvance(selectedPurchaseForDue.supplierName).toLocaleString()}</p>
                </div>
                <Wallet className="text-blue-300" size={32} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (৳)</label>
                <input 
                  type="number" 
                  required
                  min="0.01"
                  step="0.01"
                  max={selectedPurchaseForDue.totalCost - (selectedPurchaseForDue.paidAmount || 0)}
                  value={duePaymentData.amount}
                  onChange={e => setDuePaymentData({...duePaymentData, amount: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                <textarea 
                  placeholder="Payment notes..."
                  value={duePaymentData.remarks}
                  onChange={e => setDuePaymentData({...duePaymentData, remarks: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 h-24 resize-none"
                />
              </div>

              {getSupplierAdvance(selectedPurchaseForDue.supplierName) > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input 
                    type="checkbox"
                    id="adjustFromAdvance"
                    checked={duePaymentData.adjustFromAdvance}
                    onChange={e => setDuePaymentData({...duePaymentData, adjustFromAdvance: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="adjustFromAdvance" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Adjust from supplier advance
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-md print-modal-container">
          <div 
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col print-modal-content"
          >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 print:hidden">
                <h3 className="text-xl font-black text-slate-900">Purchase Receipt</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleShareWhatsApp(selectedReceipt)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl flex items-center transition-all text-sm font-bold shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    <Share2 size={18} className="mr-2" /> Share
                  </button>
                  <button 
                    onClick={() => exportToPDF('receipt-content', `purchase-receipt-${selectedReceipt.id.substring(0, 6)}.pdf`)}
                    className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl flex items-center transition-all text-sm font-bold shadow-lg active:scale-95"
                  >
                    <Printer size={18} className="mr-2" /> PDF
                  </button>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-12 overflow-y-auto custom-scrollbar print:p-0" id="receipt-content">
                <div className="text-center mb-12 border-b-4 border-slate-900 pb-8">
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{state.companyInfo.name}</h1>
                  <p className="text-slate-500 font-bold">{state.companyInfo.address}</p>
                  <p className="text-slate-500 font-bold">Phone: {state.companyInfo.phone} | Email: {state.companyInfo.email}</p>
                  <div className="mt-6 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full">
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Purchase Receipt</span>
                  </div>
                </div>

                <div className="flex justify-between mb-12">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier Details</p>
                    <p className="font-black text-slate-900 text-2xl">{selectedReceipt.supplierName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Receipt Info</p>
                    <p className="font-black text-slate-900">Date: {selectedReceipt.date}</p>
                    <p className="font-black text-indigo-600">#PR-{selectedReceipt.id.substring(0, 6).toUpperCase()}</p>
                  </div>
                </div>

                <table className="w-full mb-12">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="text-left py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="text-right py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Qty (kg)</th>
                      <th className="text-right py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rate (৳)</th>
                      <th className="text-right py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-6 font-bold text-slate-900">{selectedReceipt.type === 'dry' ? 'Dry Powder' : 'Wet Powder'}</td>
                      <td className="py-6 text-right font-bold text-slate-900">{selectedReceipt.quantity.toFixed(2)}</td>
                      <td className="py-6 text-right font-bold text-slate-900">{selectedReceipt.pricePerKg.toFixed(2)}</td>
                      <td className="py-6 text-right font-black text-slate-900 text-lg">{selectedReceipt.totalCost.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end mb-16">
                  <div className="w-72 space-y-4">
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>Subtotal:</span>
                      <span>৳{(selectedReceipt.quantity * selectedReceipt.pricePerKg).toLocaleString()}</span>
                    </div>
                    {selectedReceipt.discount > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold">
                        <span>Discount:</span>
                        <span>- ৳{selectedReceipt.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-600 font-black">
                      <span>Paid Amount:</span>
                      <span>৳{(selectedReceipt.paidAmount !== undefined ? selectedReceipt.paidAmount : selectedReceipt.totalCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-500 font-black">
                      <span>Due Amount:</span>
                      <span>৳{(selectedReceipt.totalCost - (selectedReceipt.paidAmount !== undefined ? selectedReceipt.paidAmount : selectedReceipt.totalCost)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-3xl font-black text-slate-900 border-t-4 border-slate-900 pt-4">
                      <span>Total:</span>
                      <span>৳{selectedReceipt.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-32">
                  <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-200 mb-3"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Supplier Sign</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-200 mb-3"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Authorized Sign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
