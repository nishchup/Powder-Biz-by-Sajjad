import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { PieChart, TrendingUp, Wallet, Package, Sun, Filter, FileText, ShoppingCart, Droplets, Receipt, Printer, Clock, DollarSign } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';
import { ProductionCharts } from './ProductionCharts';
import { FinancialCharts } from './FinancialCharts';

export const Reports: React.FC = () => {
  const { state, wetStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportTab, setReportTab] = useState<'summary' | 'purchases' | 'drying' | 'sales' | 'expenses' | 'labor' | 'due' | 'profitWithdraw'>('summary');

  const filteredPurchases = useMemo(() => {
    return (state.purchases || []).filter(p => {
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      return true;
    });
  }, [state.purchases, startDate, endDate]);

  const filteredConversions = useMemo(() => {
    return (state.conversions || []).filter(c => {
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      return true;
    });
  }, [state.conversions, startDate, endDate]);

  const filteredSales = useMemo(() => {
    return (state.sales || []).filter(s => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      return true;
    });
  }, [state.sales, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return (state.expenses || []).filter(e => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [state.expenses, startDate, endDate]);

  const filteredLabor = useMemo(() => {
    return (state.laborRecords || []).filter(l => {
      if (startDate && l.date < startDate) return false;
      if (endDate && l.date > endDate) return false;
      return true;
    });
  }, [state.laborRecords, startDate, endDate]);

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLabor = filteredLabor.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLoans = (state.loans || []).filter(l => {
    if (startDate && l.date < startDate) return false;
    if (endDate && l.date > endDate) return false;
    return true;
  }).reduce((sum, l) => sum + l.amount, 0);
  
  const totalCompanyAdvances = (state.companyAdvances || []).filter(a => {
    if (startDate && a.date < startDate) return false;
    if (endDate && a.date > endDate) return false;
    return true;
  }).reduce((sum, a) => sum + a.amount, 0);
  
  const totalProfitWithdrawals = (state.profitWithdrawals || []).filter(pw => {
    if (startDate && pw.date < startDate) return false;
    if (endDate && pw.date > endDate) return false;
    return true;
  }).reduce((sum, pw) => sum + pw.amount, 0);

  const netProfit = totalSales + totalCompanyAdvances - (totalPurchases + totalExpenses + totalLabor + totalLoans + totalProfitWithdrawals);

  return (
    <div className="space-y-8" id="reports-content">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Detailed financial insights and production tracking</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <button 
            onClick={() => exportToPDF('reports-content', `powderBiz-report-${getTodayDate()}.pdf`)} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-slate-900/20 font-bold text-sm"
          >
            <Printer size={18} className="mr-2" /> {t('print')}
          </button>
          
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-2">
            <div className="flex items-center text-slate-500 px-3">
              <Filter size={16} className="mr-2 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-slate-400 font-bold text-xs">TO</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 bg-rose-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden print:block mb-10 text-center border-b-2 border-slate-100 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
            <Package className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">{state.companyInfo.name}</h1>
        </div>
        <h2 className="text-xl font-bold text-slate-600 uppercase tracking-[0.2em]">Financial Performance Report</h2>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm font-bold text-slate-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center">
            <Filter size={16} className="mr-2" />
            Period: {startDate ? new Date(startDate).toLocaleDateString() : 'All Time'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-3 print:hidden scrollbar-hide">
        {[
          { id: 'summary', label: 'Summary', icon: PieChart },
          { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
          { id: 'drying', label: 'Drying', icon: Sun },
          { id: 'sales', label: 'Sales', icon: TrendingUp },
          { id: 'expenses', label: 'Expenses', icon: Wallet },
          { id: 'labor', label: 'Labor', icon: Clock },
          { id: 'due', label: 'Dues', icon: Receipt },
          { id: 'profitWithdraw', label: 'Profit Withdraw', icon: DollarSign },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setReportTab(tab.id as any)} 
            className={`flex items-center px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              reportTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {reportTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Income vs Expense Summary */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <PieChart className="text-blue-600" size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Income & Expenses</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Total Sales (Revenue)</span>
                  <span className="font-bold text-emerald-600">৳{(totalSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Company Advances (In)</span>
                  <span className="font-bold text-emerald-600">৳{(totalCompanyAdvances || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base mt-3 pt-3 border-t border-emerald-200/50">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">Total Inflow</span>
                  <span className="font-black text-emerald-700">৳{((totalSales || 0) + (totalCompanyAdvances || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Purchases (Wet Powder)</span>
                  <span className="font-bold text-rose-500">৳{(totalPurchases || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Total Expenses</span>
                  <span className="font-bold text-rose-500">৳{(totalExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Labor Costs</span>
                  <span className="font-bold text-rose-500">৳{(totalLabor || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Total Loans</span>
                  <span className="font-bold text-rose-500">৳{(totalLoans || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-600 font-semibold">Profit Withdrawals</span>
                  <span className="font-bold text-rose-500">৳{(totalProfitWithdrawals || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base mt-3 pt-3 border-t border-rose-200/50">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">Total Outflow</span>
                  <span className="font-black text-rose-700">৳{((totalPurchases || 0) + (totalExpenses || 0) + (totalLabor || 0) + (totalLoans || 0) + (totalProfitWithdrawals || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Profitability</h3>
            </div>
            
            <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
              (netProfit || 0) >= 0 
                ? 'bg-emerald-50/30 border-emerald-200' 
                : 'bg-rose-50/30 border-rose-200'
            }`}>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Net Performance</p>
              <h1 className={`text-5xl font-black tracking-tighter ${(netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(netProfit || 0) >= 0 ? '+' : ''}৳{(netProfit || 0).toLocaleString()}
              </h1>
              <div className="mt-6 flex items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                <Wallet size={16} className="mr-2 text-blue-500" />
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Filtered Balance</span>
              </div>
            </div>
          </div>

          {/* Inventory Valuation (Estimated) */}
          <div className="md:col-span-2 glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">Current Inventory Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center text-white">
                <div className="bg-white/20 p-4 rounded-xl mr-5 backdrop-blur-md">
                  <Package className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Wet Powder Stock</p>
                  <p className="text-3xl font-black">{(wetStock || 0).toFixed(2)} <span className="text-lg font-medium opacity-80">kg</span></p>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center text-white">
                <div className="bg-white/20 p-4 rounded-xl mr-5 backdrop-blur-md">
                  <Sun className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-100 uppercase tracking-widest mb-1">Dry Powder Stock</p>
                  <p className="text-3xl font-black">{(dryStock || 0).toFixed(2)} <span className="text-lg font-medium opacity-80">kg</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 glass-panel p-8 rounded-3xl overflow-hidden">
            <FinancialCharts startDate={startDate} endDate={endDate} />
          </div>
        </div>
      )}

      {reportTab === 'purchases' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Purchases Report</h3>
            <div className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-xl font-black text-sm">
              Total: ৳{(totalPurchases || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Qty (kg)</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Price/kg</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No data found for selected dates.</td></tr>
                ) : (
                  <>
                    {filteredPurchases.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-4 text-sm font-bold text-slate-600">{p.date}</td>
                        <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{p.supplierName}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-blue-600">{(p.quantity || 0).toFixed(2)}</td>
                        <td className="px-8 py-4 text-sm text-right font-medium text-slate-500">৳{(p.pricePerKg || 0).toFixed(2)}</td>
                        <td className="px-8 py-4 text-sm text-right font-black text-slate-900">৳{(p.totalCost || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={2} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Summary Total</td>
                      <td className="px-8 py-5 text-sm text-right font-black">
                        {filteredPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0).toFixed(2)} kg
                      </td>
                      <td className="px-8 py-5 text-xs text-right text-slate-400 font-bold uppercase tracking-widest">Avg: ৳{(totalPurchases / (filteredPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0) || 1)).toFixed(2)}</td>
                      <td className="px-8 py-5 text-lg text-right font-black text-rose-400">৳{totalPurchases.toLocaleString()}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'sales' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Sales Report</h3>
            <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-sm">
              Total: ৳{(totalSales || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Qty (kg)</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Price/kg</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No data found for selected dates.</td></tr>
                ) : (
                  <>
                    {filteredSales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-4 text-sm font-bold text-slate-600">{s.date}</td>
                        <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{s.customerName}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-emerald-600">{(s.quantity || 0).toFixed(2)}</td>
                        <td className="px-8 py-4 text-sm text-right font-medium text-slate-500">৳{(s.pricePerKg || 0).toFixed(2)}</td>
                        <td className="px-8 py-4 text-sm text-right font-black text-emerald-700">৳{(s.totalRevenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={2} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Summary Total</td>
                      <td className="px-8 py-5 text-sm text-right font-black">
                        {filteredSales.reduce((sum, s) => sum + (s.quantity || 0), 0).toFixed(2)} kg
                      </td>
                      <td className="px-8 py-5 text-xs text-right text-slate-400 font-bold uppercase tracking-widest">Avg: ৳{(totalSales / (filteredSales.reduce((sum, s) => sum + (s.quantity || 0), 0) || 1)).toFixed(2)}</td>
                      <td className="px-8 py-5 text-lg text-right font-black text-emerald-400">৳{totalSales.toLocaleString()}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'drying' && (
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl overflow-hidden">
            <ProductionCharts startDate={startDate} endDate={endDate} />
          </div>
          
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Drying Process Report</h3>
              <div className="flex flex-wrap gap-3 justify-end">
                <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider">
                  Wet Used: {filteredConversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0).toFixed(2)} kg
                </div>
                <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider">
                  Dry Produced: {filteredConversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0).toFixed(2)} kg
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider">
                  Total Cost: ৳{filteredConversions.reduce((sum, c) => sum + ((c.wetQuantityUsed || 0) * (c.purchasePrice || 0)), 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Wet Used (kg)</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Wet Cost (৳)</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Yield %</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Dry Produced (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConversions.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No data found for selected dates.</td></tr>
                  ) : (
                    <>
                      {filteredConversions.map(c => {
                        const yieldPercent = (c.dryQuantityProduced / c.wetQuantityUsed) * 100;
                        const wetCost = (c.wetQuantityUsed || 0) * (c.purchasePrice || 0);
                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-4 text-sm font-bold text-slate-600">{c.date}</td>
                            <td className="px-8 py-4 text-sm text-right font-bold text-blue-600">{(c.wetQuantityUsed || 0).toFixed(2)}</td>
                            <td className="px-8 py-4 text-sm text-right font-bold text-emerald-600">৳{wetCost.toLocaleString()}</td>
                            <td className="px-8 py-4 text-sm text-center">
                              <span className="px-3 py-1 bg-slate-100 rounded-full font-black text-xs text-slate-700">
                                {(yieldPercent || 0).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-8 py-4 text-sm text-right font-black text-amber-600">{(c.dryQuantityProduced || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Summary Total</td>
                        <td className="px-8 py-5 text-sm text-right font-black text-blue-400">
                          {filteredConversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0).toFixed(2)} kg
                        </td>
                        <td className="px-8 py-5 text-sm text-right font-black text-emerald-400">
                          ৳{filteredConversions.reduce((sum, c) => sum + ((c.wetQuantityUsed || 0) * (c.purchasePrice || 0)), 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-sm text-center font-black">
                          {(() => {
                            const totalWet = filteredConversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0);
                            const totalDry = filteredConversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0);
                            return totalWet > 0 ? ((totalDry / totalWet) * 100).toFixed(1) + '%' : '0%';
                          })()}
                        </td>
                        <td className="px-8 py-5 text-lg text-right font-black text-amber-400">
                          {filteredConversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0).toFixed(2)} kg
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportTab === 'expenses' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Expenses Report</h3>
            <div className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-xl font-black text-sm">
              Total: ৳{(totalExpenses || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">No data found for selected dates.</td></tr>
                ) : (
                  <>
                    {filteredExpenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-4 text-sm font-bold text-slate-600">{e.date}</td>
                        <td className="px-8 py-4 text-sm">
                          <span className="px-3 py-1 bg-slate-100 rounded-full font-black text-[10px] text-slate-600 uppercase tracking-wider">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm font-medium text-slate-500">{e.description}</td>
                        <td className="px-8 py-4 text-sm text-right font-black text-rose-600">৳{(e.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={3} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Summary Total</td>
                      <td className="px-8 py-5 text-lg text-right font-black text-rose-400">৳{totalExpenses.toLocaleString()}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {reportTab === 'labor' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Labor Report</h3>
            <div className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-xl font-black text-sm">
              Total: ৳{(totalLabor || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Worker</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Process</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Hours</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLabor.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold italic">No labor records for this period.</td>
                  </tr>
                ) : (
                  <>
                    {filteredLabor.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-4 text-sm font-bold text-slate-600">{record.date}</td>
                        <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{record.workerName}</td>
                        <td className="px-8 py-4 text-sm font-medium text-slate-500">{record.processName}</td>
                        <td className="px-8 py-4 text-sm text-center">
                          <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full font-black text-[10px] uppercase tracking-wider">
                            {record.hours}h
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm text-right font-medium text-slate-500">৳{record.hourlyRate.toLocaleString()}</td>
                        <td className="px-8 py-4 text-sm font-black text-slate-900 text-right">৳{record.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={5} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Summary Total</td>
                      <td className="px-8 py-5 text-lg text-right font-black text-teal-400">৳{totalLabor.toLocaleString()}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'due' && (
        <div className="space-y-8">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Customer Dues (Sales)</h3>
              <div className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest">
                Action Required
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Billed</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Paid</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {(state.customers || []).map(c => {
                    const customerSales = (state.sales || []).filter(s => s.customerName === c.name);
                    const totalBilled = customerSales.reduce((sum, s) => sum + s.totalRevenue, 0);
                    const totalPaidSales = customerSales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0);
                    const totalPayments = (state.customerPayments || []).filter(p => p.customerName === c.name).reduce((sum, p) => sum + p.amount, 0);
                    const totalPaid = totalPaidSales + totalPayments;
                    const due = totalBilled - totalPaid;
                    
                    if (due <= 0) return null;
                    
                    return (
                      <tr key={c.id} className="hover:bg-rose-50/30 transition-colors group">
                        <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{c.name}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-slate-600">৳{totalBilled.toLocaleString()}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</td>
                        <td className="px-8 py-4 text-sm text-right font-black text-rose-600">৳{due.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {state.customers.length === 0 && (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Supplier Advances & Dues</h3>
              <div className="flex items-center gap-3">
                {(() => {
                  const supplierBalances = (state.suppliers || []).map(s => {
                    const supplierPurchases = (state.purchases || []).filter(p => p.supplierName === s.name);
                    const totalBilled = supplierPurchases.reduce((sum, p) => sum + p.totalCost, 0);
                    const totalPaidPurchases = supplierPurchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
                    const totalPayments = (state.supplierPayments || []).filter(p => p.supplierName === s.name).reduce((sum, p) => sum + p.amount, 0);
                    const totalPaid = totalPaidPurchases + totalPayments;
                    return totalPaid - totalBilled;
                  });

                  const totalAdvance = supplierBalances.filter(b => b > 0).reduce((sum, b) => sum + b, 0);
                  const totalDues = supplierBalances.filter(b => b < 0).reduce((sum, b) => sum + Math.abs(b), 0);

                  return (
                    <>
                      <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest">
                        Total Advance: ৳{totalAdvance.toLocaleString()}
                      </div>
                      <div className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest">
                        Total Dues: ৳{totalDues.toLocaleString()}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Billed</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total Paid</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Balance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {(state.suppliers || []).map(s => {
                    const supplierPurchases = (state.purchases || []).filter(p => p.supplierName === s.name);
                    const totalBilled = supplierPurchases.reduce((sum, p) => sum + p.totalCost, 0);
                    const totalPaidPurchases = supplierPurchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
                    const totalPayments = (state.supplierPayments || []).filter(p => p.supplierName === s.name).reduce((sum, p) => sum + p.amount, 0);
                    const totalPaid = totalPaidPurchases + totalPayments;
                    const balance = totalPaid - totalBilled; // Positive = Advance, Negative = Due
                    
                    if (balance === 0) return null;
                    
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 transition-colors group ${balance > 0 ? 'bg-indigo-50/10' : 'bg-rose-50/10'}`}>
                        <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{s.name}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-slate-600">৳{totalBilled.toLocaleString()}</td>
                        <td className="px-8 py-4 text-sm text-right font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</td>
                        <td className={`px-8 py-4 text-sm text-right font-black ${balance > 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${balance > 0 ? 'bg-indigo-100' : 'bg-rose-100'}`}>
                            {balance > 0 ? `Advance: ৳${balance.toLocaleString()}` : `Due: ৳${Math.abs(balance).toLocaleString()}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {state.suppliers.length === 0 && (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">No suppliers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {reportTab === 'profitWithdraw' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Profit Withdrawal Report</h3>
            <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-xl font-black text-sm">
              Total Withdrawn: ৳{(totalProfitWithdrawals || 0).toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Delivery Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Delivery Description</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Net Profit</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Withdrawn</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(state.productDeliveries || []).length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No product deliveries found.</td></tr>
                ) : (
                  <>
                    {(state.productDeliveries || []).map(d => {
                      const withdrawn = (state.profitWithdrawals || [])
                        .filter(pw => pw.deliveryId === d.id)
                        .reduce((sum, pw) => sum + pw.amount, 0);
                      const remaining = d.netProfit - withdrawn;
                      
                      return (
                        <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-4 text-sm font-bold text-slate-600">{d.date}</td>
                          <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{d.description}</td>
                          <td className="px-8 py-4 text-sm text-right font-bold text-emerald-600">৳{d.netProfit.toLocaleString()}</td>
                          <td className="px-8 py-4 text-sm text-right font-bold text-rose-500">৳{withdrawn.toLocaleString()}</td>
                          <td className={`px-8 py-4 text-sm text-right font-black ${remaining >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                            ৳{remaining.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={2} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em]">Overall Summary</td>
                      <td className="px-8 py-5 text-sm text-right font-black text-emerald-400">
                        ৳{(state.productDeliveries || []).reduce((sum, d) => sum + d.netProfit, 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-sm text-right font-black text-rose-400">
                        ৳{(state.profitWithdrawals || []).reduce((sum, pw) => sum + pw.amount, 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-lg text-right font-black text-indigo-400">
                        ৳{((state.productDeliveries || []).reduce((sum, d) => sum + d.netProfit, 0) - (state.profitWithdrawals || []).reduce((sum, pw) => sum + pw.amount, 0)).toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {(state.profitWithdrawals || []).length > 0 && (
            <div className="mt-8 p-8 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Withdrawal History</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(state.profitWithdrawals || [])
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(pw => (
                    <div key={pw.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500">{pw.date}</span>
                        <span className="text-sm font-black text-rose-600">৳{pw.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-black text-slate-900 mb-1">
                        Ref: {(state.productDeliveries || []).find(d => d.id === pw.deliveryId)?.description || 'Unknown'}
                      </p>
                      {pw.notes && <p className="text-[10px] text-slate-500 italic">"{pw.notes}"</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};