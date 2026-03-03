import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, ShoppingCart, Receipt, Printer, Share2 } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';

export const Purchases: React.FC = () => {
  const { state, addPurchase, editPurchase, deletePurchase } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  const sortedPurchases = [...state.purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedPurchases.length / itemsPerPage);
  const paginatedPurchases = sortedPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6" id="purchases-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Purchases</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('purchases-content', 'purchases-report.pdf')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
            >
              <Plus size={20} className="mr-2" />
              Add Purchase
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Purchase' : 'New Purchase Details'}
              </h3>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supplier Name</label>
              <select 
                required
                value={formData.supplierName}
                onChange={e => setFormData({...formData, supplierName: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="" disabled>Select a supplier</option>
                {state.suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {state.suppliers.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Please add a supplier in Contacts first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Powder Type</label>
              <select 
                required
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as 'wet' | 'dry'})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="wet">Wet Powder</option>
                <option value="dry">Dry Powder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Bag</label>
              <input 
                type="number" 
                min="1"
                step="1"
                placeholder="0"
                value={formData.totalBags}
                onChange={e => setFormData({...formData, totalBags: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity (kg)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price per kg (৳)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.pricePerKg}
                onChange={e => setFormData({...formData, pricePerKg: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {formData.quantity && formData.pricePerKg && (
                <p className="text-sm text-blue-600 font-bold mt-2">
                  Payable Amount: ৳{(parseFloat(formData.quantity) * parseFloat(formData.pricePerKg)).toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount (৳)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paid Amount (৳)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="Leave empty for full payment"
                value={formData.paidAmount}
                onChange={e => setFormData({...formData, paidAmount: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-4 pt-4 border-t border-slate-100">
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
                    {editingId ? 'Update Purchase' : 'Save Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Bags</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price/kg</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Cost</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No purchases recorded yet.</p>
                      <p className="text-sm mt-1">Click "Add Purchase" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-700">{p.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{p.supplierName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.type === 'dry' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {p.type === 'dry' ? 'Dry' : 'Wet'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">{p.totalBags || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">{(p.quantity || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">৳{(p.pricePerKg || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">৳{(p.discount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold">৳{(p.totalCost || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">৳{(p.paidAmount !== undefined ? p.paidAmount : p.totalCost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-500 text-right font-medium">৳{(p.totalCost - (p.paidAmount !== undefined ? p.paidAmount : p.totalCost)).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2 transition-opacity">
                        <button 
                          onClick={() => setSelectedReceipt(p)}
                          className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                          title="Receipt"
                        >
                          <Receipt size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deletePurchase(p.id)}
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
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedPurchases.length)}</span> of <span className="font-medium">{sortedPurchases.length}</span> results
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print-modal-container">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print-modal-content">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white print:hidden">
              <h3 className="text-lg font-bold text-slate-800">Purchase Receipt</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleShareWhatsApp(selectedReceipt)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm font-medium"
                >
                  <Share2 size={16} className="mr-2" /> Share
                </button>
                <button 
                  onClick={() => exportToPDF('receipt-content', `purchase-receipt-${selectedReceipt.id.substring(0, 6)}.pdf`)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm font-medium"
                >
                  <Printer size={16} className="mr-2" /> Print PDF
                </button>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 print:p-0" id="receipt-content">
              <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider">{state.companyInfo.name}</h1>
                <p className="text-slate-600 mt-1">{state.companyInfo.address}</p>
                <p className="text-slate-600">Phone: {state.companyInfo.phone} | Email: {state.companyInfo.email}</p>
                <div className="mt-4 inline-block bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">Purchase Receipt</span>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Supplier Details</p>
                  <p className="font-bold text-slate-800 text-lg">{selectedReceipt.supplierName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium mb-1">Receipt Details</p>
                  <p className="font-bold text-slate-800">Date: {selectedReceipt.date}</p>
                  <p className="font-bold text-slate-800">Receipt #: PR-{selectedReceipt.id.substring(0, 6).toUpperCase()}</p>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="text-left py-3 font-bold text-slate-800">Description</th>
                    <th className="text-right py-3 font-bold text-slate-800">Qty (kg)</th>
                    <th className="text-right py-3 font-bold text-slate-800">Rate (৳)</th>
                    <th className="text-right py-3 font-bold text-slate-800">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-4 text-slate-800">{selectedReceipt.type === 'dry' ? 'Dry Powder' : 'Wet Powder'}</td>
                    <td className="py-4 text-right text-slate-800">{selectedReceipt.quantity.toFixed(2)}</td>
                    <td className="py-4 text-right text-slate-800">{selectedReceipt.pricePerKg.toFixed(2)}</td>
                    <td className="py-4 text-right font-bold text-slate-800">{selectedReceipt.totalCost.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>৳{(selectedReceipt.quantity * selectedReceipt.pricePerKg).toLocaleString()}</span>
                  </div>
                  {selectedReceipt.discount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span>- ৳{selectedReceipt.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Paid Amount:</span>
                    <span>৳{(selectedReceipt.paidAmount !== undefined ? selectedReceipt.paidAmount : selectedReceipt.totalCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-500 font-medium">
                    <span>Due Amount:</span>
                    <span>৳{(selectedReceipt.totalCost - (selectedReceipt.paidAmount !== undefined ? selectedReceipt.paidAmount : selectedReceipt.totalCost)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-800 pt-2">
                    <span>Total:</span>
                    <span>৳{selectedReceipt.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-24 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <p className="text-sm font-medium text-slate-600">Supplier Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <p className="text-sm font-medium text-slate-600">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
