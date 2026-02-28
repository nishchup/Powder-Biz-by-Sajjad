import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { PieChart, TrendingUp, Wallet, Package, Sun, Filter, FileText, ShoppingCart, Droplets, Receipt, Printer } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';

export const Reports: React.FC = () => {
  const { state, wetStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportTab, setReportTab] = useState<'summary' | 'purchases' | 'drying' | 'sales' | 'expenses' | 'due'>('summary');

  const filteredPurchases = useMemo(() => {
    return state.purchases.filter(p => {
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      return true;
    });
  }, [state.purchases, startDate, endDate]);

  const filteredConversions = useMemo(() => {
    return state.conversions.filter(c => {
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      return true;
    });
  }, [state.conversions, startDate, endDate]);

  const filteredSales = useMemo(() => {
    return state.sales.filter(s => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      return true;
    });
  }, [state.sales, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return state.expenses.filter(e => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [state.expenses, startDate, endDate]);

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLoans = state.loans.filter(l => {
    if (startDate && l.date < startDate) return false;
    if (endDate && l.date > endDate) return false;
    return true;
  }).reduce((sum, l) => sum + l.amount, 0);
  
  const netProfit = totalSales - (totalPurchases + totalExpenses + totalLoans);

  return (
    <div className="space-y-6" id="reports-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => exportToPDF('reports-content', 'business-report.pdf')} 
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
          >
            <Printer size={18} className="mr-2" /> {t('print')}
          </button>
          
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-2">
            <div className="flex items-center text-gray-500 px-2">
              <Filter size={16} className="mr-2" />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">{state.companyInfo.name} Financial Report</h1>
        <p className="text-slate-500 mt-2">
          Date Range: {startDate ? new Date(startDate).toLocaleDateString() : 'All Time'} to {endDate ? new Date(endDate).toLocaleDateString() : 'All Time'}
        </p>
      </div>

      {/* Report Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-200 pb-2 print:hidden scrollbar-hide">
        <button onClick={() => setReportTab('summary')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Summary</button>
        <button onClick={() => setReportTab('purchases')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'purchases' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Purchases Report</button>
        <button onClick={() => setReportTab('drying')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'drying' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Drying Report</button>
        <button onClick={() => setReportTab('sales')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Sales Report</button>
        <button onClick={() => setReportTab('expenses')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'expenses' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Expenses Report</button>
        <button onClick={() => setReportTab('due')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${reportTab === 'due' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Due Report</button>
      </div>

      {reportTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income vs Expense Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <PieChart className="text-blue-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Income & Expenses</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Sales (Revenue)</span>
                  <span className="font-semibold text-green-600">৳{(totalSales || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Purchases (Wet Powder)</span>
                  <span className="font-semibold text-red-500">৳{(totalPurchases || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-red-500">৳{(totalExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Loans</span>
                  <span className="font-semibold text-red-500">৳{(totalLoans || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-800">Total Outflow</span>
                  <span className="font-bold text-red-600">৳{((totalPurchases || 0) + (totalExpenses || 0) + (totalLoans || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <TrendingUp className="text-green-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Profitability</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500 mb-2">Net Profit / Loss</p>
              <h1 className={`text-4xl font-bold ${(netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(netProfit || 0) >= 0 ? '+' : ''}৳{(netProfit || 0).toLocaleString()}
              </h1>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Wallet size={16} className="mr-1" />
                <span>Filtered Balance</span>
              </div>
            </div>
          </div>

          {/* Inventory Valuation (Estimated) */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Inventory Status (All Time)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Package className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Wet Powder in Stock</p>
                  <p className="text-2xl font-bold text-blue-900">{(wetStock || 0).toFixed(2)} kg</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Sun className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Dry Powder in Stock</p>
                  <p className="text-2xl font-bold text-yellow-900">{(dryStock || 0).toFixed(2)} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportTab === 'purchases' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Purchases Report</h3>
            <span className="text-sm font-medium text-gray-600">Total: ৳{(totalPurchases || 0).toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Qty (kg)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Price/kg</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data found for selected dates.</td></tr>
                ) : (
                  filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">{p.date}</td>
                      <td className="px-6 py-3 text-sm font-medium">{p.supplierName}</td>
                      <td className="px-6 py-3 text-sm text-right">{(p.quantity || 0).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-right">৳{(p.pricePerKg || 0).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold">৳{(p.totalCost || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'sales' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Sales Report</h3>
            <span className="text-sm font-medium text-gray-600">Total: ৳{(totalSales || 0).toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Qty (kg)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Price/kg</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data found for selected dates.</td></tr>
                ) : (
                  filteredSales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">{s.date}</td>
                      <td className="px-6 py-3 text-sm font-medium">{s.customerName}</td>
                      <td className="px-6 py-3 text-sm text-right">{(s.quantity || 0).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-right">৳{(s.pricePerKg || 0).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-green-600">৳{(s.totalRevenue || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'drying' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Drying Process Report</h3>
            <span className="text-sm font-medium text-gray-600">
              Total Dry Produced: {filteredConversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0).toFixed(2)} kg
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Wet Used (kg)</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Yield %</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Dry Produced (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConversions.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No data found for selected dates.</td></tr>
                ) : (
                  filteredConversions.map(c => {
                    const yieldPercent = (c.dryQuantityProduced / c.wetQuantityUsed) * 100;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm">{c.date}</td>
                        <td className="px-6 py-3 text-sm text-right text-blue-600">{(c.wetQuantityUsed || 0).toFixed(2)}</td>
                        <td className="px-6 py-3 text-sm text-center">{(yieldPercent || 0).toFixed(1)}%</td>
                        <td className="px-6 py-3 text-sm text-right font-semibold text-yellow-600">{(c.dryQuantityProduced || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'expenses' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Expenses Report</h3>
            <span className="text-sm font-medium text-gray-600">Total: ৳{(totalExpenses || 0).toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No data found for selected dates.</td></tr>
                ) : (
                  filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">{e.date}</td>
                      <td className="px-6 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{e.category}</span></td>
                      <td className="px-6 py-3 text-sm">{e.description}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-red-600">৳{(e.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {reportTab === 'due' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Customer Dues (Sales)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Billed</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Paid</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.customers.map(c => {
                    const customerSales = state.sales.filter(s => s.customerName === c.name);
                    const totalBilled = customerSales.reduce((sum, s) => sum + s.totalRevenue, 0);
                    const totalPaidSales = customerSales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0);
                    const totalPayments = state.customerPayments.filter(p => p.customerName === c.name).reduce((sum, p) => sum + p.amount, 0);
                    const totalPaid = totalPaidSales + totalPayments;
                    const due = totalBilled - totalPaid;
                    
                    if (due <= 0) return null;
                    
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">{c.name}</td>
                        <td className="px-6 py-3 text-sm text-right">৳{totalBilled.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-right text-green-600">৳{totalPaid.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-red-600">৳{due.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {state.customers.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Supplier Advances & Dues (Purchases)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Billed</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Paid</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.suppliers.map(s => {
                    const supplierPurchases = state.purchases.filter(p => p.supplierName === s.name);
                    const totalBilled = supplierPurchases.reduce((sum, p) => sum + p.totalCost, 0);
                    const totalPaidPurchases = supplierPurchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
                    const totalPayments = state.supplierPayments.filter(p => p.supplierName === s.name).reduce((sum, p) => sum + p.amount, 0);
                    const totalPaid = totalPaidPurchases + totalPayments;
                    const balance = totalPaid - totalBilled; // Positive = Advance, Negative = Due
                    
                    if (balance === 0) return null;
                    
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">{s.name}</td>
                        <td className="px-6 py-3 text-sm text-right">৳{totalBilled.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-right text-green-600">৳{totalPaid.toLocaleString()}</td>
                        <td className={`px-6 py-3 text-sm text-right font-bold ${balance > 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                          {balance > 0 ? `Advance: ৳${balance.toLocaleString()}` : `Due: ৳${Math.abs(balance).toLocaleString()}`}
                        </td>
                      </tr>
                    );
                  })}
                  {state.suppliers.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No suppliers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
