import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, X, Truck, Calendar, TrendingUp, TrendingDown, Wallet, ShoppingCart, Printer, FileText } from 'lucide-react';
import { useTranslation } from '../translations';
import { exportToPDF } from '../services/pdfService';

export const ProductDelivery: React.FC = () => {
  const { state, addProductDelivery, deleteProductDelivery } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const summary = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;

    // 1. Cost of wet powder from Drying Process (Conversions)
    const filteredConversions = state.conversions.filter(c => c.date >= formData.startDate && c.date <= formData.endDate);
    const wetPowderCost = filteredConversions.reduce((sum, c) => sum + ((c.wetQuantityUsed || 0) * (c.purchasePrice || 0)), 0);

    // 2. Cost of dry powder from Purchases
    const filteredDryPurchases = state.purchases.filter(p => p.type === 'dry' && p.date >= formData.startDate && p.date <= formData.endDate);
    const dryPowderCost = filteredDryPurchases.reduce((sum, p) => sum + p.totalCost, 0);

    const totalPurchases = wetPowderCost + dryPowderCost;

    const filteredSales = state.sales.filter(s => s.date >= formData.startDate && s.date <= formData.endDate);
    const filteredExpenses = state.expenses.filter(e => e.date >= formData.startDate && e.date <= formData.endDate);

    const totalSales = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalSales - (totalPurchases + totalExpenses);

    return {
      totalPurchases,
      totalSales,
      totalExpenses,
      netProfit,
      wetPowderCost,
      dryPowderCost
    };
  }, [formData.startDate, formData.endDate, state.purchases, state.sales, state.expenses, state.conversions]);

  const handleCancel = () => {
    setIsFormOpen(false);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      startDate: '', 
      endDate: new Date().toISOString().split('T')[0], 
      description: '' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summary && formData.startDate && formData.endDate) {
      addProductDelivery({
        date: formData.date,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPurchases: summary.totalPurchases,
        wetPowderCost: summary.wetPowderCost,
        dryPowderCost: summary.dryPowderCost,
        totalSales: summary.totalSales,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        description: formData.description,
      });
      handleCancel();
    }
  };

  return (
    <div className="space-y-6" id="product-delivery-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('productDelivery')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('product-delivery-content', 'product-delivery-report.pdf')}
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
              Add Delivery Report
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">New Delivery Summary</h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Report Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {summary && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchases/Cost</p>
                  <p className="text-xl font-bold text-slate-900">৳{summary.totalPurchases.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Wet (Drying): ৳{summary.wetPowderCost.toLocaleString()}<br/>
                    Dry (Direct): ৳{summary.dryPowderCost.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</p>
                  <p className="text-xl font-bold text-green-600">৳{summary.totalSales.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                  <p className="text-xl font-bold text-red-500">৳{summary.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit/Loss</p>
                  <p className={`text-xl font-black ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ৳{summary.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Notes (Optional)</label>
              <textarea 
                rows={2}
                placeholder="Add any details about this delivery..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!summary}
                className={`font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm ${
                  summary ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Save Delivery Report
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Purchases/Cost</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Sales</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Expenses</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Net Profit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.productDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No delivery reports saved yet.</p>
                      <p className="text-sm mt-1">Click "Add Delivery Report" to create your first summary.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                [...state.productDeliveries].reverse().map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{d.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 text-slate-400" />
                        {d.startDate} to {d.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right">৳{d.totalPurchases.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">৳{d.totalSales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-500 text-right font-medium">৳{d.totalExpenses.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm text-right font-bold ${d.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ৳{d.netProfit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => setSelectedDelivery(d)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => deleteProductDelivery(d.id)}
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

      {/* Delivery Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Truck className="mr-2 text-blue-600" /> Delivery Summary Report
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => exportToPDF('delivery-report-content', `delivery-report-${selectedDelivery.date}.pdf`)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm font-medium"
                >
                  <Printer size={16} className="mr-2" /> Print PDF
                </button>
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 sm:p-10" id="delivery-report-content">
              <div className="text-center mb-10 border-b-2 border-slate-800 pb-8">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider">{state.companyInfo.name}</h1>
                <p className="text-slate-600 mt-1">{state.companyInfo.address}</p>
                <p className="text-slate-600">Phone: {state.companyInfo.phone} | Email: {state.companyInfo.email}</p>
                <div className="mt-6 inline-block bg-slate-900 text-white px-6 py-2 rounded-full">
                  <span className="font-bold uppercase tracking-widest text-sm">Product Delivery Report</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Report Date</p>
                  <p className="text-lg font-bold text-slate-800">{selectedDelivery.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reporting Period</p>
                  <p className="text-lg font-bold text-slate-800">{selectedDelivery.startDate} to {selectedDelivery.endDate}</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <ShoppingCart className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Total Purchases/Cost</span>
                      {(selectedDelivery.wetPowderCost !== undefined || selectedDelivery.dryPowderCost !== undefined) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Wet (Drying): ৳{(selectedDelivery.wetPowderCost || 0).toLocaleString()} | Dry (Direct): ৳{(selectedDelivery.dryPowderCost || 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900">৳{selectedDelivery.totalPurchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <span className="font-semibold text-slate-700">Total Sales</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">৳{selectedDelivery.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <Wallet className="text-red-600" size={20} />
                    </div>
                    <span className="font-semibold text-slate-700">Total Expenses</span>
                  </div>
                  <span className="text-lg font-bold text-red-500">৳{selectedDelivery.totalExpenses.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center p-6 rounded-xl border-2 ${selectedDelivery.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedDelivery.netProfit >= 0 ? 'bg-emerald-200' : 'bg-red-200'}`}>
                      {selectedDelivery.netProfit >= 0 ? <TrendingUp className="text-emerald-700" size={24} /> : <TrendingDown className="text-red-700" size={24} />}
                    </div>
                    <div>
                      <span className={`font-bold text-lg ${selectedDelivery.netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>Net Profit / Loss</span>
                      <p className="text-xs text-slate-500 font-medium">Calculated for the selected period</p>
                    </div>
                  </div>
                  <span className={`text-2xl font-black ${selectedDelivery.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ৳{selectedDelivery.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedDelivery.description && (
                <div className="mb-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Description</p>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    "{selectedDelivery.description}"
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-20 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <p className="text-sm font-medium text-slate-600">Prepared By</p>
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
