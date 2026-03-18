import * as React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { Plus, Trash2, Pencil, X, Sun, Printer, FileText, History, AlertCircle, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';
import { ConfirmModal } from './ConfirmModal';

export const Conversions: React.FC = () => {
  const { state, addConversion, editConversion, deleteConversion, wetStock, wetBagsStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    wetQuantityUsed: '',
    dryQuantityProduced: '',
    purchasePrice: '',
    bagsUsed: '',
    purchaseId: '',
  });

  const handleEdit = (c: any) => {
    setFormData({
      date: c.date,
      wetQuantityUsed: c.wetQuantityUsed.toString(),
      dryQuantityProduced: c.dryQuantityProduced.toString(),
      purchasePrice: c.purchasePrice ? c.purchasePrice.toString() : '',
      bagsUsed: c.bagsUsed ? c.bagsUsed.toString() : '',
      purchaseId: c.purchaseId || '',
    });
    setEditingId(c.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setError(null);
    setFormData({ 
      date: getTodayDate(), 
      wetQuantityUsed: '', 
      dryQuantityProduced: '', 
      purchasePrice: '', 
      bagsUsed: '',
      purchaseId: '',
    });
  };

  const wetPurchases = (state.purchases || []).filter(p => p.type === 'wet' || !p.type);

  const getPurchaseAvailable = (purchaseId: string, excludeConversionId?: string | null) => {
    const purchase = (state.purchases || []).find(p => p.id === purchaseId);
    if (!purchase) return { bags: 0, quantity: 0 };

    const usedInConversions = (state.conversions || [])
      .filter(c => c.purchaseId === purchaseId && c.id !== excludeConversionId)
      .reduce((acc, c) => ({
        bags: acc.bags + (c.bagsUsed || 0),
        quantity: acc.quantity + (c.wetQuantityUsed || 0)
      }), { bags: 0, quantity: 0 });

    return {
      bags: (purchase.totalBags || 0) - usedInConversions.bags,
      quantity: (purchase.quantity || 0) - usedInConversions.quantity,
      originalBags: purchase.totalBags || 0,
      originalQuantity: purchase.quantity || 0,
      pricePerKg: purchase.pricePerKg
    };
  };

  const handleBagsUsedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bags = parseFloat(e.target.value);
    const purchaseId = formData.purchaseId;
    
    if (purchaseId && !isNaN(bags)) {
      const purchase = (state.purchases || []).find(p => p.id === purchaseId);
      if (purchase && purchase.totalBags && purchase.totalBags > 0) {
        const wetQty = (purchase.quantity / purchase.totalBags) * bags;
        const estimatedDry = wetQty * 0.8;
        const netPrice = purchase.quantity > 0 ? purchase.totalCost / purchase.quantity : purchase.pricePerKg;
        
        setFormData({
          ...formData,
          bagsUsed: e.target.value,
          wetQuantityUsed: wetQty.toFixed(2),
          dryQuantityProduced: estimatedDry.toFixed(2),
          purchasePrice: netPrice.toString()
        });
      } else {
        setFormData({ ...formData, bagsUsed: e.target.value });
      }
    } else {
      setFormData({ ...formData, bagsUsed: e.target.value });
    }
  };

  const handleWetQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wetQty = parseFloat(e.target.value);
    if (!isNaN(wetQty)) {
      const estimatedDry = wetQty * 0.8;
      setFormData({
        ...formData,
        wetQuantityUsed: e.target.value,
        dryQuantityProduced: estimatedDry.toFixed(2),
      });
    } else {
      setFormData({
        ...formData,
        wetQuantityUsed: e.target.value,
        dryQuantityProduced: '',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wetQty = parseFloat(formData.wetQuantityUsed);
    const dryQty = parseFloat(formData.dryQuantityProduced);
    const bagsUsed = parseFloat(formData.bagsUsed);
    const purchaseId = formData.purchaseId;
    
    if (wetQty > 0 && dryQty > 0) {
      if (purchaseId) {
        const available = getPurchaseAvailable(purchaseId, editingId);
        if (bagsUsed > available.bags) {
          setError(`Not enough bags in this purchase! Available: ${available.bags} bags`);
          return;
        }
        if (wetQty > available.quantity) {
          setError(`Not enough quantity in this purchase! Available: ${available.quantity.toFixed(2)} kg`);
          return;
        }
      } else {
        const oldWetQty = editingId ? ((state.conversions || []).find(c => c.id === editingId)?.wetQuantityUsed || 0) : 0;
        const availableWetStock = wetStock + oldWetQty;

        if (wetQty > availableWetStock) {
          setError(`Not enough wet stock! Available: ${availableWetStock.toFixed(2)} kg`);
          return;
        }

        const oldBagsUsed = editingId ? ((state.conversions || []).find(c => c.id === editingId)?.bagsUsed || 0) : 0;
        const availableBagsStock = wetBagsStock + oldBagsUsed;

        if (bagsUsed > availableBagsStock) {
          setError(`Not enough bags! Available: ${availableBagsStock} bags`);
          return;
        }
      }

      setError(null);
      
      let remainBags = 0;
      let remainQuantity = 0;
      if (purchaseId) {
        const available = getPurchaseAvailable(purchaseId, editingId);
        remainBags = available.bags - bagsUsed;
        remainQuantity = available.quantity - wetQty;
      }

      const data = {
        date: formData.date,
        wetQuantityUsed: wetQty,
        dryQuantityProduced: dryQty,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        bagsUsed: bagsUsed || 0,
        purchaseId: purchaseId || undefined,
        remainBags: purchaseId ? remainBags : undefined,
        remainQuantity: purchaseId ? remainQuantity : undefined,
      };

      if (editingId) {
        editConversion(editingId, data);
      } else {
        addConversion(data);
      }
      
      handleCancel();
    }
  };

  const sortedConversions = [...(state.conversions || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedConversions.length / itemsPerPage);
  const paginatedConversions = sortedConversions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedPurchaseAvailable = formData.purchaseId ? getPurchaseAvailable(formData.purchaseId, editingId) : null;
  const currentRemainBags = selectedPurchaseAvailable ? selectedPurchaseAvailable.bags - (parseFloat(formData.bagsUsed) || 0) : 0;
  const currentRemainQuantity = selectedPurchaseAvailable ? selectedPurchaseAvailable.quantity - (parseFloat(formData.wetQuantityUsed) || 0) : 0;

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
      id="conversions-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Drying Process</h2>
          <p className="text-slate-500 font-medium">Track conversion from wet powder to dry powder.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('conversions-content', 'drying-report.pdf')}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print Report
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-amber-100 font-bold active:scale-95"
          >
            <Plus size={24} className="mr-2" />
            Record Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-[2rem] flex items-center group bg-blue-50/50 border-blue-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-6 group-hover:scale-110 transition-transform">
            <Package size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Wet Stock</p>
            <p className="text-3xl font-black text-blue-900">{(wetStock || 0).toFixed(1)} <span className="text-sm font-bold text-blue-400">kg</span></p>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] flex items-center group bg-indigo-50/50 border-indigo-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mr-6 group-hover:scale-110 transition-transform">
            <FileText size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Wet Bags</p>
            <p className="text-3xl font-black text-indigo-900">{wetBagsStock || 0} <span className="text-sm font-bold text-indigo-400">bags</span></p>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] flex items-center group bg-amber-50/50 border-amber-100">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mr-6 group-hover:scale-110 transition-transform">
            <Sun size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Dry Stock</p>
            <p className="text-3xl font-black text-amber-900">{(dryStock || 0).toFixed(1)} <span className="text-sm font-bold text-amber-400">kg</span></p>
          </div>
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
                  {editingId ? 'Edit Drying Batch' : 'New Drying Batch'}
                </h3>
                <p className="text-slate-500 font-medium">Record conversion metrics for this batch</p>
              </div>
              <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {error && (
                <div 
                  className="mb-8 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl text-sm font-bold flex items-center"
                >
                  <AlertCircle className="mr-3 shrink-0" size={20} />
                  {error}
                </div>
              )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Purchase</label>
                    <select
                      value={formData.purchaseId}
                      onChange={e => {
                        const pId = e.target.value;
                        const purchase = (state.purchases || []).find(p => p.id === pId);
                        setFormData({
                          ...formData, 
                          purchaseId: pId,
                          purchasePrice: purchase ? purchase.pricePerKg.toString() : formData.purchasePrice
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="">-- Select Purchase (Optional) --</option>
                      {wetPurchases
                        .filter(p => {
                          const avail = getPurchaseAvailable(p.id, editingId);
                          return avail.bags > 0 || p.id === formData.purchaseId;
                        })
                        .map(p => {
                          const avail = getPurchaseAvailable(p.id, editingId);
                          return (
                            <option key={p.id} value={p.id}>
                              {p.date} - {p.supplierName} ({avail.bags} bags)
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bags Used</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="1"
                      placeholder="0"
                      value={formData.bagsUsed}
                      onChange={handleBagsUsedChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                    {formData.purchaseId && (
                      <p className="text-[10px] font-black uppercase tracking-wider ml-1">
                        Remain: <span className={currentRemainBags < 0 ? 'text-rose-500' : 'text-blue-500'}>{currentRemainBags} bags</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Wet Powder Used (kg)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.wetQuantityUsed}
                      onChange={handleWetQuantityChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                    {formData.purchaseId && (
                      <p className="text-[10px] font-black uppercase tracking-wider ml-1">
                        Remain: <span className={currentRemainQuantity < 0 ? 'text-rose-500' : 'text-blue-500'}>{currentRemainQuantity.toFixed(2)} kg</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Price (৳/kg)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={e => setFormData({...formData, purchasePrice: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dry Powder Produced (kg)</label>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.dryQuantityProduced}
                      onChange={e => setFormData({...formData, dryQuantityProduced: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Yield estimated at 80%</p>
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
                      {editingId ? 'Update Batch' : 'Save Batch'}
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
            <History className="mr-3 text-amber-500" size={24} />
            Drying Batch History
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Batches: {(state.conversions || []).length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Purchase Source</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Bags</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Wet (kg)</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Dry (kg)</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Yield</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedConversions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Sun className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No drying batches yet</p>
                      <p className="text-slate-400 font-medium mt-1">Start recording your production batches.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedConversions.map((c) => {
                  const yieldPercent = (c.dryQuantityProduced / c.wetQuantityUsed) * 100;
                  const purchase = (state.purchases || []).find(p => p.id === c.purchaseId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{c.date}</td>
                      <td className="px-8 py-5">
                        {purchase ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{purchase.supplierName}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{purchase.date}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-300 italic">Unlinked</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-900 text-right font-black">{c.bagsUsed || 0}</td>
                      <td className="px-8 py-5 text-sm text-blue-600 text-right font-black">{(c.wetQuantityUsed || 0).toFixed(1)}</td>
                      <td className="px-8 py-5 text-sm text-amber-600 text-right font-black">{(c.dryQuantityProduced || 0).toFixed(1)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          yieldPercent >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {(yieldPercent || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center print:hidden">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => setSelectedReceipt(c)}
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center active:scale-90"
                            title="View Receipt"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(c)}
                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setItemToDelete(c.id);
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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-md print-modal-container">
          <div 
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] print-modal-content"
          >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 print:hidden">
                <h3 className="text-xl font-black text-slate-900">Batch Receipt</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => exportToPDF('drying-receipt-print', `drying-receipt-${selectedReceipt.id}.pdf`)}
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
              
              <div className="p-12 overflow-y-auto custom-scrollbar print:p-0" id="drying-receipt-print">
                <div className="text-center mb-12 border-b-4 border-slate-900 pb-8">
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{state.companyInfo.name}</h1>
                  <p className="text-slate-500 font-bold">{state.companyInfo.address}</p>
                  <div className="mt-6 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full">
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Drying Process Batch</span>
                  </div>
                </div>

                <div className="flex justify-between mb-12">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Batch Info</p>
                    <p className="font-black text-slate-900">Date: {selectedReceipt.date}</p>
                    <p className="font-black text-amber-600">ID: DRY-{selectedReceipt.id.slice(0,6).toUpperCase()}</p>
                  </div>
                </div>

                {selectedReceipt.purchaseId && (
                  <div className="mb-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Linked Purchase</p>
                    {(() => {
                      const p = (state.purchases || []).find(p => p.id === selectedReceipt.purchaseId);
                      return p ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Supplier</p>
                            <p className="font-black text-slate-900">{p.supplierName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Source Date</p>
                            <p className="font-black text-slate-900">{p.date}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Bags Used</span>
                    <span className="font-black text-slate-900 text-lg">{selectedReceipt.bagsUsed || 0} bags</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Wet Powder Used</span>
                    <span className="font-black text-blue-600 text-lg">{(selectedReceipt.wetQuantityUsed || 0).toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Dry Powder Produced</span>
                    <span className="font-black text-amber-600 text-lg">{(selectedReceipt.dryQuantityProduced || 0).toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-6">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Yield Percentage</span>
                    <span className="font-black text-slate-900 text-3xl">
                      {((selectedReceipt.dryQuantityProduced / selectedReceipt.wetQuantityUsed) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-24">
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-slate-200 mb-3"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Head</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-slate-200 mb-3"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Sign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Batch"
        message="Are you sure you want to delete this drying batch record? This will also revert the stock changes. This action cannot be undone."
        onConfirm={() => itemToDelete && deleteConversion(itemToDelete)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};
