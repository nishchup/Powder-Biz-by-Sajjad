import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Sun, Printer, FileText } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';

export const Conversions: React.FC = () => {
  const { state, addConversion, editConversion, deleteConversion, wetStock, wetBagsStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
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
      date: new Date().toISOString().split('T')[0], 
      wetQuantityUsed: '', 
      dryQuantityProduced: '', 
      purchasePrice: '', 
      bagsUsed: '',
      purchaseId: '',
    });
  };

  const wetPurchases = state.purchases.filter(p => p.type === 'wet' || !p.type);

  const getPurchaseAvailable = (purchaseId: string, excludeConversionId?: string | null) => {
    const purchase = state.purchases.find(p => p.id === purchaseId);
    if (!purchase) return { bags: 0, quantity: 0 };

    const usedInConversions = state.conversions
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
      const purchase = state.purchases.find(p => p.id === purchaseId);
      if (purchase && purchase.totalBags && purchase.totalBags > 0) {
        // wetQty = (totalQty / totalBags) * bagsUsed
        const wetQty = (purchase.quantity / purchase.totalBags) * bags;
        const estimatedDry = wetQty * 0.8;
        
        setFormData({
          ...formData,
          bagsUsed: e.target.value,
          wetQuantityUsed: wetQty.toFixed(2),
          dryQuantityProduced: estimatedDry.toFixed(2),
          purchasePrice: purchase.pricePerKg.toString()
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
      // 1 kg wet = 800g dry (200g loss) -> 80% yield
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
      // Check stock if purchase is selected
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
        // Legacy check for overall stock
        const oldWetQty = editingId ? (state.conversions.find(c => c.id === editingId)?.wetQuantityUsed || 0) : 0;
        const availableWetStock = wetStock + oldWetQty;

        if (wetQty > availableWetStock) {
          setError(`Not enough wet stock! Available: ${availableWetStock.toFixed(2)} kg`);
          return;
        }

        const oldBagsUsed = editingId ? (state.conversions.find(c => c.id === editingId)?.bagsUsed || 0) : 0;
        const availableBagsStock = wetBagsStock + oldBagsUsed;

        if (bagsUsed > availableBagsStock) {
          setError(`Not enough bags! Available: ${availableBagsStock} bags`);
          return;
        }
      }

      setError(null);
      
      // Calculate remain values for this specific batch relative to the purchase
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

  const sortedConversions = [...state.conversions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedConversions.length / itemsPerPage);
  const paginatedConversions = sortedConversions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate current remaining for the selected purchase in the form
  const selectedPurchaseAvailable = formData.purchaseId ? getPurchaseAvailable(formData.purchaseId, editingId) : null;
  const currentRemainBags = selectedPurchaseAvailable ? selectedPurchaseAvailable.bags - (parseFloat(formData.bagsUsed) || 0) : 0;
  const currentRemainQuantity = selectedPurchaseAvailable ? selectedPurchaseAvailable.quantity - (parseFloat(formData.wetQuantityUsed) || 0) : 0;

  return (
    <div className="space-y-6" id="conversions-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('dryingProcess')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('conversions-content', 'drying-report.pdf')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
          >
            <Printer size={18} className="mr-2" />
            {t('print')}
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
            >
              <Plus size={20} className="mr-2" />
              Record Batch
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-sm text-blue-800 font-semibold mb-1">Available Wet Stock</p>
            <p className="text-3xl font-bold text-blue-900">{(wetStock || 0).toFixed(2)} <span className="text-lg font-medium">kg</span></p>
          </div>
          <div>
            <p className="text-sm text-blue-800 font-semibold mb-1">Available Bags</p>
            <p className="text-3xl font-bold text-blue-900">{wetBagsStock || 0} <span className="text-lg font-medium">bags</span></p>
          </div>
          <div className="border-l border-blue-200 pl-8">
            <p className="text-sm text-blue-800 font-semibold mb-1">Dry Powder Stock</p>
            <p className="text-3xl font-bold text-blue-900">{(dryStock || 0).toFixed(2)} <span className="text-lg font-medium">kg</span></p>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Edit Drying Batch' : 'New Drying Batch'}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Purchase</label>
              <select
                value={formData.purchaseId}
                onChange={e => {
                  const pId = e.target.value;
                  const purchase = state.purchases.find(p => p.id === pId);
                  setFormData({
                    ...formData, 
                    purchaseId: pId,
                    purchasePrice: purchase ? purchase.pricePerKg.toString() : formData.purchasePrice
                  });
                }}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              >
                <option value="">-- Select Purchase (Optional) --</option>
                {wetPurchases.map(p => {
                  const avail = getPurchaseAvailable(p.id, editingId);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.date} - {p.supplierName} - {avail.bags} bags avail
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bags Used</label>
              <input 
                type="number" 
                required
                min="0"
                step="1"
                placeholder="0"
                value={formData.bagsUsed}
                onChange={handleBagsUsedChange}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
              {formData.purchaseId && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Remain Bags: <span className={currentRemainBags < 0 ? 'text-red-600' : 'text-blue-600'}>{currentRemainBags}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wet Powder Used (kg)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.wetQuantityUsed}
                onChange={handleWetQuantityChange}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
              {formData.purchaseId && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Remain Quantity: <span className={currentRemainQuantity < 0 ? 'text-red-600' : 'text-blue-600'}>{currentRemainQuantity.toFixed(2)} kg</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Purchase Price (per kg)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={e => setFormData({...formData, purchasePrice: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dry Powder Produced (kg)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.dryQuantityProduced}
                onChange={e => setFormData({...formData, dryQuantityProduced: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">Auto-calculated at 80% yield.</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-3 mt-2 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Update Batch' : 'Save Batch'}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Bags Used</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Wet Used (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Purchase Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Dry Produced (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Yield %</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedConversions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Sun className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No drying batches recorded yet.</p>
                      <p className="text-sm mt-1">Click "Record Batch" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedConversions.map((c) => {
                  const yieldPercent = (c.dryQuantityProduced / c.wetQuantityUsed) * 100;
                  const purchase = state.purchases.find(p => p.id === c.purchaseId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-700">{c.date}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {purchase ? (
                          <>
                            <div className="font-medium">{purchase.supplierName}</div>
                            <div className="text-xs text-slate-500">{purchase.date}</div>
                            <div className="text-xs text-blue-600 mt-1">
                              Remain: {c.remainBags || 0} bags | {(c.remainQuantity || 0).toFixed(2)} kg
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">No purchase linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">{c.bagsUsed || 0}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold text-right">{(c.wetQuantityUsed || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium text-right">
                        ৳{((c.wetQuantityUsed || 0) * (c.purchasePrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <br/>
                        <span className="text-xs text-slate-400">@ ৳{c.purchasePrice || 0}/kg</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-600 font-semibold text-right">{(c.dryQuantityProduced || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          yieldPercent >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(yieldPercent || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center print:hidden">
                        <div className="flex items-center justify-center space-x-2 transition-opacity">
                          <button 
                            onClick={() => setSelectedReceipt(c)}
                            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-md hover:bg-emerald-50 transition-colors"
                            title="View Receipt"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteConversion(c.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors"
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
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedConversions.length)}</span> of <span className="font-medium">{sortedConversions.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <FileText className="mr-2 text-emerald-600" /> Drying Process Receipt
              </h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto" id="drying-receipt-print">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">{state.companyInfo.name || 'PowderBiz'}</h2>
                {state.companyInfo.address && <p className="text-sm text-slate-500">{state.companyInfo.address}</p>}
                {state.companyInfo.phone && <p className="text-sm text-slate-500">Phone: {state.companyInfo.phone}</p>}
                <div className="mt-4 inline-block px-4 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">
                  Drying Process Receipt
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Batch Date</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedReceipt.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receipt ID</p>
                  <p className="text-sm font-semibold text-slate-800">DRY-{selectedReceipt.id.toUpperCase()}</p>
                </div>
              </div>

              {/* Purchase Info */}
              {selectedReceipt.purchaseId && (
                <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Linked Purchase Info</p>
                  {(() => {
                    const p = state.purchases.find(p => p.id === selectedReceipt.purchaseId);
                    return p ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-blue-600">Supplier</p>
                          <p className="text-sm font-bold text-slate-800">{p.supplierName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600">Purchase Date</p>
                          <p className="text-sm font-bold text-slate-800">{p.date}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Description</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-slate-600">Bags Used</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{selectedReceipt.bagsUsed || 0} bags</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-600">Wet Powder Used</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{(selectedReceipt.wetQuantityUsed || 0).toFixed(2)} kg</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-600">Purchase Price</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">৳{(selectedReceipt.purchasePrice || 0).toFixed(2)} /kg</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600 font-semibold">Total Wet Cost</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ৳{((selectedReceipt.wetQuantityUsed || 0) * (selectedReceipt.purchasePrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-600">Dry Powder Produced</td>
                      <td className="px-4 py-3 text-right font-bold text-yellow-600">{(selectedReceipt.dryQuantityProduced || 0).toFixed(2)} kg</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-600">Yield Percentage</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        {((selectedReceipt.dryQuantityProduced / selectedReceipt.wetQuantityUsed) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stock Remaining Info */}
              {selectedReceipt.purchaseId && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remain Bags</p>
                    <p className="text-lg font-bold text-slate-800">{selectedReceipt.remainBags || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remain Quantity</p>
                    <p className="text-lg font-bold text-slate-800">{(selectedReceipt.remainQuantity || 0).toFixed(2)} kg</p>
                  </div>
                </div>
              )}

              <div className="mt-12 text-center">
                <p className="text-xs text-slate-400 italic">Thank you for your business!</p>
                <p className="text-[10px] text-slate-300 mt-1">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => exportToPDF('drying-receipt-print', `drying-receipt-${selectedReceipt.id}.pdf`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm flex items-center"
              >
                <Printer size={18} className="mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
