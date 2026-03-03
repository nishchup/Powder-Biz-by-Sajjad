import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Receipt, Printer, TrendingUp, Share2, Download } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';

export const Sales: React.FC = () => {
  const { state, addSale, editSale, deleteSale, dryStock } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      // If editing, we need to add back the old quantity to dryStock for validation
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

  const sortedSales = [...state.sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6" id="sales-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dry Powder Sales</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('sales-content', 'sales-report.pdf')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
            >
              <Plus size={20} className="mr-2" />
              Add Sale
            </button>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm text-amber-800 font-semibold mb-1">Available Dry Stock</p>
          <p className="text-3xl font-bold text-amber-900">{(dryStock || 0).toFixed(2)} <span className="text-lg font-medium">kg</span></p>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Sale' : 'New Sale Details'}
              </h3>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer Name</label>
              <select 
                required
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
              >
                <option value="" disabled>Select a customer</option>
                {state.customers.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {state.customers.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Please add a customer in Contacts first.</p>
              )}
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
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
              {formData.quantity && formData.pricePerKg && (
                <p className="text-sm text-green-600 font-bold mt-2">
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
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    {editingId ? 'Update Sale' : 'Save Sale'}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price/kg</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <TrendingUp className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No sales recorded yet.</p>
                      <p className="text-sm mt-1">Click "Add Sale" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-700">{s.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{s.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">{(s.quantity || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">৳{(s.pricePerKg || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">৳{(s.discount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-bold">৳{(s.totalRevenue || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">৳{(s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-500 text-right font-medium">৳{(s.totalRevenue - (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue)).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2 transition-opacity">
                        <button 
                          onClick={() => setSelectedChallan(s)}
                          className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-md hover:bg-emerald-50 transition-colors"
                          title="Print Challan"
                        >
                          <Receipt size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(s)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteSale(s.id)}
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
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedSales.length)}</span> of <span className="font-medium">{sortedSales.length}</span> results
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

      {/* Challan Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto print-modal-container">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative print-modal-content" id="challan-content">
            <div className="print:hidden absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={() => handleShareWhatsApp(selectedChallan)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
              >
                <Share2 size={18} className="mr-2"/> Share
              </button>
              <button 
                onClick={() => exportToPDF('challan-content', `sales-challan-${selectedChallan.id.substring(0, 8)}.pdf`)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
              >
                <Download size={18} className="mr-2"/> Download PDF
              </button>
              <button 
                onClick={() => setSelectedChallan(null)} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="text-center mb-10 mt-4 print:mt-0">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{state.companyInfo.name}</h1>
              <p className="text-slate-600 mt-1">{state.companyInfo.address}</p>
              <p className="text-slate-600">Phone: {state.companyInfo.phone} | Email: {state.companyInfo.email}</p>
              <div className="mt-4 inline-block bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">Sales Challan / Invoice</span>
              </div>
            </div>
            
            <div className="flex justify-between mb-8 pb-6 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-500 mb-1">Billed To:</p>
                <p className="font-bold text-xl text-slate-800">{selectedChallan.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Date:</p>
                <p className="font-bold text-slate-800">{selectedChallan.date}</p>
                <p className="text-sm text-slate-500 mt-3 mb-1">Challan No:</p>
                <p className="font-bold text-slate-800">#{selectedChallan.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-3 font-bold text-slate-800">Description</th>
                  <th className="py-3 font-bold text-slate-800 text-right">Quantity</th>
                  <th className="py-3 font-bold text-slate-800 text-right">Rate</th>
                  <th className="py-3 font-bold text-slate-800 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-4 text-slate-800 font-medium">Dry Powder</td>
                  <td className="py-4 text-right text-slate-700">{selectedChallan.quantity.toFixed(2)} kg</td>
                  <td className="py-4 text-right text-slate-700">৳{selectedChallan.pricePerKg.toFixed(2)}</td>
                  <td className="py-4 text-right font-bold text-slate-900">৳{selectedChallan.totalRevenue.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="flex justify-end mb-16">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>৳{(selectedChallan.quantity * selectedChallan.pricePerKg).toLocaleString()}</span>
                </div>
                {selectedChallan.discount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span>- ৳{selectedChallan.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Paid Amount:</span>
                  <span>৳{(selectedChallan.paidAmount !== undefined ? selectedChallan.paidAmount : selectedChallan.totalRevenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500 font-medium">
                  <span>Due Amount:</span>
                  <span>৳{(selectedChallan.totalRevenue - (selectedChallan.paidAmount !== undefined ? selectedChallan.paidAmount : selectedChallan.totalRevenue)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-800 pt-2">
                  <span>Total:</span>
                  <span>৳{selectedChallan.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-slate-500 px-4">
              <div className="border-t border-slate-300 pt-2 w-40 text-center">Customer Signature</div>
              <div className="border-t border-slate-300 pt-2 w-40 text-center">Authorized Signature</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
