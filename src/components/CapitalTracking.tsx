import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { Wallet, TrendingUp, TrendingDown, PieChart, ArrowRightLeft, Package, Users, Receipt, DollarSign, Plus, Edit2, Calendar, X } from 'lucide-react';
import { useTranslation } from '../translations';

export const CapitalTracking: React.FC = () => {
  const { state, setInitialCapital, wetStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [newCapital, setNewCapital] = useState(state.initialCapital.toString());

  const [dateRange, setDateRange] = useState({
    start: '',
    end: getTodayDate()
  });

  // Auto-select start date based on last sale date
  useEffect(() => {
    if (state.sales.length > 0) {
      const dates = state.sales.map(s => new Date(s.date).getTime());
      const lastSaleTime = Math.max(...dates);
      const lastSaleDate = new Date(lastSaleTime);
      
      // Calculate next day
      const nextDay = new Date(lastSaleDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const nextDayStr = nextDay.toISOString().split('T')[0];
      
      setDateRange(prev => ({
        ...prev,
        start: nextDayStr
      }));
    } else {
      // Fallback to first day of current month if no sales
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      setDateRange(prev => ({
        ...prev,
        start: firstDay
      }));
    }
  }, [state.sales.length]); // Re-run if sales count changes

  const handleSaveCapital = () => {
    const amount = parseFloat(newCapital) || 0;
    setInitialCapital(amount);
    setIsEditingCapital(false);
  };

  const stats = useMemo(() => {
    // 1. FIFO Stock Valuation Helper
    const calculateFIFOValue = (stockQty: number, purchases: typeof state.purchases) => {
      const sorted = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let remaining = Number(stockQty) || 0;
      let value = 0;
      for (const p of sorted) {
        if (remaining <= 0) break;
        const qty = Number(p.quantity) || 0;
        const take = Math.min(remaining, qty);
        const price = qty > 0 ? (Number(p.totalCost) || 0) / qty : 0;
        value += take * price;
        remaining -= take;
      }
      if (remaining > 0 && sorted.length > 0) {
        const oldest = sorted[sorted.length - 1];
        const qty = Number(oldest.quantity) || 0;
        const price = qty > 0 ? (Number(oldest.totalCost) || 0) / qty : 0;
        value += remaining * price;
      }
      return value;
    };

    const wetPurchases = state.purchases.filter(p => p.type === 'wet' || !p.type);
    const wetStockValue = calculateFIFOValue(wetStock, wetPurchases);

    const calculateDryStockFIFOValue = () => {
      const inflows = [
        ...state.conversions.map(c => ({
          date: c.date,
          quantity: Number(c.dryQuantityProduced) || 0,
          cost: (Number(c.wetQuantityUsed) || 0) * (Number(c.purchasePrice) || 0)
        })),
        ...state.purchases.filter(p => p.type === 'dry').map(p => ({
          date: p.date,
          quantity: Number(p.quantity) || 0,
          cost: Number(p.totalCost) || 0
        }))
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalSold = state.sales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      let soldRemaining = totalSold;
      
      const sortedInflows = [...inflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let remainingDry = Number(dryStock) || 0;
      let dryValue = 0;

      for (const inflow of sortedInflows) {
        if (remainingDry <= 0) break;
        const take = Math.min(remainingDry, inflow.quantity);
        const unitCost = inflow.quantity > 0 ? inflow.cost / inflow.quantity : 0;
        dryValue += take * unitCost;
        remainingDry -= take;
      }

      return dryValue;
    };

    const dryStockValue = calculateDryStockFIFOValue();

    // Calculate conversion ratio to determine Wet Equivalent of Dry Stock
    const totalWetUsed = state.conversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0);
    const totalDryProduced = state.conversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0);
    const conversionRatio = totalDryProduced > 0 ? totalWetUsed / totalDryProduced : 1;

    // For display purposes only
    const avgWetPrice = wetPurchases.length > 0 
      ? wetPurchases.reduce((sum, p) => sum + p.totalCost, 0) / wetPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0)
      : 0;

    // 3. Supplier Advances & Dues
    const allSupplierNames = Array.from(new Set([
      ...state.suppliers.map(s => s.name),
      ...state.purchases.map(p => p.supplierName),
      ...state.supplierPayments.map(p => p.supplierName)
    ])).filter(Boolean);

    const supplierBalances = allSupplierNames.map(name => {
      const supplierPurchases = state.purchases.filter(p => p.supplierName === name);
      const supplierPayments = state.supplierPayments.filter(p => p.supplierName === name);
      
      const totalCost = supplierPurchases.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
      const totalPaidInPurchases = supplierPurchases.reduce((sum, p) => {
        const paid = p.paidAmount !== undefined ? Number(p.paidAmount) : Number(p.totalCost);
        return sum + (isNaN(paid) ? 0 : paid);
      }, 0);
      const totalStandalonePayments = supplierPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      
      return (totalPaidInPurchases + totalStandalonePayments) - totalCost;
    });

    const supplierAdvances = supplierBalances.reduce((total, balance) => total + (balance > 0 ? balance : 0), 0);
    const supplierDues = supplierBalances.reduce((total, balance) => total + (balance < 0 ? Math.abs(balance) : 0), 0);

    const allCustomerNames = Array.from(new Set([
      ...state.customers.map(c => c.name),
      ...state.sales.map(s => s.customerName),
      ...state.customerPayments.map(p => p.customerName)
    ])).filter(Boolean);

    const customerBalances = allCustomerNames.map(name => {
      const customerSales = state.sales.filter(s => s.customerName === name);
      const customerPayments = state.customerPayments.filter(p => p.customerName === name);
      
      const totalBilled = customerSales.reduce((sum, s) => sum + (Number(s.totalRevenue) || 0), 0);
      const totalPaidInSales = customerSales.reduce((sum, s) => {
        const paid = s.paidAmount !== undefined ? Number(s.paidAmount) : Number(s.totalRevenue);
        return sum + (isNaN(paid) ? 0 : paid);
      }, 0);
      const totalStandalonePayments = customerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      
      return totalBilled - (totalPaidInSales + totalStandalonePayments);
    });

    const customerDues = customerBalances.reduce((total, balance) => total + (balance > 0 ? balance : 0), 0);
    const customerAdvances = customerBalances.reduce((total, balance) => total + (balance < 0 ? Math.abs(balance) : 0), 0);

    const totalDues = supplierDues + customerDues;
    const totalLoans = state.loans.reduce((sum, l) => sum + l.amount, 0);
    const totalCompanyAdvances = state.companyAdvances.reduce((sum, a) => sum + a.amount, 0);

    // 4. In-hand Cash Calculation (Cash Flow Method)
    // Cash = Initial Capital + All Cash Inflows - All Cash Outflows
    
    const cashInflows = [
      state.sales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0),
      state.customerPayments.reduce((sum, p) => sum + p.amount, 0),
      state.loans.reduce((sum, l) => sum + l.amount, 0),
      state.companyAdvances.reduce((sum, a) => sum + a.amount, 0)
    ].reduce((a, b) => a + b, 0);

    const cashOutflows = [
      state.purchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0),
      state.supplierPayments.reduce((sum, p) => sum + p.amount, 0),
      state.expenses.reduce((sum, e) => sum + e.amount, 0),
      state.laborRecords.reduce((sum, l) => sum + l.totalCost, 0),
      state.profitWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    ].reduce((a, b) => a + b, 0);

    const totalExpensesAllTime = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLaborAllTime = state.laborRecords.reduce((sum, l) => sum + l.totalCost, 0);
    const totalProfitWithdrawals = state.profitWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const filteredExpenses = state.expenses.filter(e => {
      if (dateRange.start && e.date < dateRange.start) return false;
      if (dateRange.end && e.date > dateRange.end) return false;
      return true;
    }).reduce((sum, e) => sum + e.amount, 0);

    const filteredLabor = state.laborRecords.filter(l => {
      if (dateRange.start && l.date < dateRange.start) return false;
      if (dateRange.end && l.date > dateRange.end) return false;
      return true;
    }).reduce((sum, l) => sum + l.totalCost, 0);

    const inhandCash = state.initialCapital + cashInflows - cashOutflows;

    const totalAssets = wetStockValue + dryStockValue + supplierAdvances + customerDues + inhandCash;
    const totalLiabilities = supplierDues + totalLoans + totalCompanyAdvances;
    const netWorth = totalAssets - totalLiabilities;
    const difference = netWorth - state.initialCapital;

    return {
      wetStockValue,
      dryStockValue,
      supplierAdvances,
      supplierDues,
      customerDues,
      customerAdvances,
      totalDues,
      totalLoans,
      totalCompanyAdvances,
      inhandCash,
      cashInflows,
      cashOutflows,
      totalAssets,
      totalLiabilities,
      netWorth,
      difference,
      avgWetPrice,
      totalExpensesAllTime,
      filteredExpenses,
      totalLabor: totalLaborAllTime,
      filteredLabor,
      totalProfitWithdrawals,
      conversionRatio
    };
  }, [state, wetStock, dryStock, dateRange]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('capitalTracking')}</h2>
          <p className="text-slate-500 font-medium">Monitor your business capital and asset distribution.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <Calendar size={20} className="text-slate-400" />
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="bg-transparent text-xs font-black text-slate-900 outline-none"
              />
              <span className="text-slate-300">to</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="bg-transparent text-xs font-black text-slate-900 outline-none"
              />
              {(dateRange.start || dateRange.end) && (
                <button 
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="ml-2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear Dates"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Capital</p>
              {isEditingCapital ? (
                <div className="flex items-center mt-1 space-x-2">
                  <input 
                    type="number" 
                    value={newCapital}
                    onChange={e => setNewCapital(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button onClick={handleSaveCapital} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase">Save</button>
                </div>
              ) : (
                <div className="flex items-center mt-1">
                  <p className="text-xl font-black text-slate-900">৳{state.initialCapital.toLocaleString()}</p>
                  <button onClick={() => setIsEditingCapital(true)} className="ml-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={64} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wet Stock Value</p>
          <p className="text-3xl font-black text-slate-900">৳{stats.wetStockValue.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 mt-2">{wetStock.toFixed(2)} kg @ ৳{stats.avgWetPrice.toFixed(2)}/kg</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={64} className="text-amber-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dry Stock Value</p>
          <p className="text-3xl font-black text-slate-900">৳{stats.dryStockValue.toLocaleString()}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-bold text-slate-400">
              {dryStock.toFixed(2)} kg (Eq. {(dryStock * (stats.conversionRatio || 1)).toFixed(2)} kg Wet)
            </p>
            <p className="text-xs font-bold text-amber-600">
              Avg Purchase Price: ৳{stats.avgWetPrice.toFixed(2)}/kg
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier Advances</p>
          <p className="text-3xl font-black text-slate-900">৳{stats.supplierAdvances.toLocaleString()}</p>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dues</p>
            <p className="text-xl font-black text-rose-600">৳{stats.totalDues.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In-hand Cash</p>
          <p className="text-3xl font-black text-emerald-600">৳{stats.inhandCash.toLocaleString()}</p>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-500">Total Inflows: ৳{stats.cashInflows.toLocaleString()}</span>
              <span className="text-slate-500">Total Outflows: ৳{stats.cashOutflows.toLocaleString()}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2">Available liquid cash (all-time)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Business Net Worth</h3>
                  <p className="text-slate-400 text-sm font-medium">Total value of all business assets</p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <PieChart size={28} className="text-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Net Worth</p>
                  <p className="text-5xl font-black tracking-tighter">৳{stats.netWorth.toLocaleString()}</p>
                </div>
                <div className="flex flex-col justify-end">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Performance vs Capital</p>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${stats.difference >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {stats.difference >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className={`text-2xl font-black ${stats.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stats.difference >= 0 ? '+' : ''}৳{Math.abs(stats.difference).toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {stats.difference >= 0 ? 'Profit' : 'Deficit'} from initial capital
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Cash Flow Breakdown</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-medium text-slate-400">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Initial Capital (+)</span>
                      <span className="text-white">৳{state.initialCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Inflows (+)</span>
                      <span className="text-emerald-400">৳{stats.cashInflows.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Outflows (-)</span>
                      <span className="text-rose-400">৳{stats.cashOutflows.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:border-l sm:border-white/5 sm:pl-4">
                    <div className="flex justify-between font-black text-sm pt-2 border-t border-white/5">
                      <span className="text-slate-200">In-hand Cash</span>
                      <span className="text-emerald-400">
                        ৳{stats.inhandCash.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2 leading-relaxed italic">
                      Cash = Initial Capital + (Sales Paid + Payments Received + Loans + Advances) - (Purchases Paid + Payments Made + Expenses + Labor + Withdrawals)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-8">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center">
              <ArrowRightLeft size={20} className="mr-2 text-indigo-600" /> Asset Distribution
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Wet Stock', value: stats.wetStockValue, color: 'bg-blue-500' },
                { label: 'Dry Stock', value: stats.dryStockValue, color: 'bg-amber-500' },
                { label: 'Supplier Advances', value: stats.supplierAdvances, color: 'bg-indigo-500' },
                { label: 'Customer Dues', value: stats.customerDues, color: 'bg-sky-500' },
                { label: 'In-hand Cash', value: stats.inhandCash, color: 'bg-emerald-500' }
              ].map((item, idx) => {
                const percentage = stats.totalAssets > 0 ? (item.value / stats.totalAssets) * 100 : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900">৳{item.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center">
              <Receipt size={20} className="mr-2 text-rose-600" /> Expense Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Period Expenses</span>
                <span className="text-xl font-black text-rose-600">৳{stats.filteredExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total All-time</span>
                <span className="text-sm font-black text-slate-600">৳{stats.totalExpensesAllTime.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium px-2">
                Expenses for the selected period. Total all-time expenses are deducted from your in-hand cash.
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white">
            <h3 className="text-lg font-black mb-4">Capital Insight</h3>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              {stats.difference >= 0 
                ? `Your business has grown by ৳${stats.difference.toLocaleString()} from your initial investment. This includes the value of your current stock and cash on hand.`
                : `Your current total assets are ৳${Math.abs(stats.difference).toLocaleString()} less than your initial capital. This may be due to high expenses or stock depreciation.`
              }
            </p>
            <div className="mt-6 pt-6 border-t border-indigo-500/30 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Growth Rate</span>
              <span className="text-xl font-black">
                {state.initialCapital > 0 ? ((stats.difference / state.initialCapital) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
