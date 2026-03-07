import * as React from 'react';
import { useAppStore } from '../store';
import { Package, Sun, TrendingUp, Wallet, DollarSign, Printer, CreditCard, Landmark, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { ProductionCharts } from './ProductionCharts';
import { FinancialCharts } from './FinancialCharts';

export const Dashboard: React.FC = () => {
  const { state, wetStock, dryStock } = useAppStore();

  const totalPurchases = state.purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSales = state.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLabor = state.laborRecords.reduce((sum, l) => sum + l.totalCost, 0);
  const netProfit = totalSales - (totalPurchases + totalExpenses + totalLabor);

  const totalPurchasesPaid = state.purchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
  const totalSalesPaid = state.sales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0);
  const totalSupplierPayments = state.supplierPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCustomerPayments = state.customerPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalLoans = state.loans.reduce((sum, l) => sum + l.amount, 0);
  const totalCompanyAdvances = state.companyAdvances.reduce((sum, a) => sum + a.amount, 0);
  const totalProfitWithdrawals = state.profitWithdrawals.reduce((sum, pw) => sum + pw.amount, 0);
  
  const finalizedRemainProfit = state.productDeliveries
    .filter(d => d.date >= '2026-03-04')
    .reduce((sum, d) => {
      const withdrawn = state.profitWithdrawals
        .filter(pw => pw.deliveryId === d.id)
        .reduce((s, pw) => s + pw.amount, 0);
      return sum + (d.netProfit - withdrawn);
    }, 0);

  const lastSaleDate = state.sales.length > 0 
    ? [...state.sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
    : null;

  const wetPurchases = state.purchases.filter(p => p.type === 'wet' || !p.type);
  const avgWetPrice = wetPurchases.length > 0 
    ? wetPurchases.reduce((sum, p) => sum + p.totalCost, 0) / wetPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0)
    : 0;

  const expensesAfterLastSale = state.expenses.filter(e => lastSaleDate && e.date > lastSaleDate);
  const laborAfterLastSale = state.laborRecords.filter(l => lastSaleDate && l.date > lastSaleDate);
  const totalExpensesAfterLastSale = expensesAfterLastSale.reduce((sum, e) => sum + e.amount, 0) + 
                                     laborAfterLastSale.reduce((sum, l) => sum + l.totalCost, 0);

  const wetStockValue = wetStock * avgWetPrice;

  const totalWetUsed = state.conversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0);
  const totalDryProduced = state.conversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0);
  const conversionRatio = totalDryProduced > 0 ? totalWetUsed / totalDryProduced : 1;
  const dryStockValue = (dryStock * conversionRatio) * avgWetPrice;

  let totalSupplierDue = 0;
  let totalSupplierAdvance = 0;
  state.suppliers.forEach(s => {
    const supplierPurchases = state.purchases.filter(p => p.supplierName === s.name);
    const totalBilled = supplierPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaidPurchases = supplierPurchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
    const totalPayments = state.supplierPayments.filter(p => p.supplierName === s.name).reduce((sum, p) => sum + p.amount, 0);
    const balance = (totalPaidPurchases + totalPayments) - totalBilled;
    if (balance < 0) totalSupplierDue += Math.abs(balance);
    else totalSupplierAdvance += balance;
  });

  const totalCustomerDue = state.customers.reduce((sum, c) => {
    const customerSales = state.sales.filter(s => s.customerName === c.name);
    const totalBilled = customerSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalPaidSales = customerSales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0);
    const totalPayments = state.customerPayments.filter(p => p.customerName === c.name).reduce((sum, p) => sum + p.amount, 0);
    return sum + (totalBilled - (totalPaidSales + totalPayments));
  }, 0);

  const inhandCash = (state.initialCapital || 0) - (wetStockValue + dryStockValue + totalSupplierAdvance) + finalizedRemainProfit - totalExpensesAfterLastSale;

  return (
    <div 
      className="space-y-8" 
      id="dashboard-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 font-medium">Welcome back! Here's what's happening today.</p>
        </div>
        <button 
          onClick={() => exportToPDF('dashboard-content', 'dashboard-report.pdf')}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-slate-200 font-bold print:hidden w-full sm:w-auto active:scale-95"
        >
          <Printer size={20} className="mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Wet Powder Stock" 
          value={`${(wetStock || 0).toFixed(2)} kg`} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Dry Powder Stock" 
          value={`${(dryStock || 0).toFixed(2)} kg`} 
          icon={Sun} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total Sales" 
          value={`৳${(totalSales || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Inhand Cash" 
          value={`৳${(inhandCash || 0).toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Net Profit" 
          value={`৳${(netProfit || 0).toLocaleString()}`} 
          icon={Wallet} 
          color={(netProfit || 0) >= 0 ? "bg-emerald-600" : "bg-rose-600"} 
        />
        <StatCard 
          title="Total Loan" 
          value={`৳${(totalLoans || 0).toLocaleString()}`} 
          icon={Landmark} 
          color="bg-violet-500" 
        />
        <StatCard 
          title="Customer Due" 
          value={`৳${(totalCustomerDue || 0).toLocaleString()}`} 
          icon={AlertCircle} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Supplier Due" 
          value={`৳${(totalSupplierDue || 0).toLocaleString()}`} 
          icon={CreditCard} 
          color="bg-rose-500" 
        />
      </div>

      {/* Capital Tracking Section */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-indigo-100 bg-indigo-50/30">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <DollarSign className="mr-2 text-indigo-500" size={24} /> Capital Tracking (মূলধন ট্র্যাকিং)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Inhand Cash</p>
                <h4 className="text-4xl font-black text-indigo-600">৳{inhandCash.toLocaleString()}</h4>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Initial Capital (+)</span>
                    <span className="text-emerald-600">৳{(state.initialCapital || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Wet Stock Value (-)</span>
                    <span className="text-rose-500">৳{wetStockValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Dry Stock Value (-)</span>
                    <span className="text-rose-500">৳{dryStockValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Supplier Advance (-)</span>
                    <span className="text-rose-500">৳{totalSupplierAdvance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Finalized Profit (Deliveries Since 04-Mar) (+)</span>
                    <span className="text-emerald-600">৳{finalizedRemainProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>Expenses (After Last Sale) (-)</span>
                    <span className="text-rose-500">৳{totalExpensesAfterLastSale.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 flex justify-between items-center text-[12px] font-black text-indigo-600">
                    <span>Net Inhand Cash</span>
                    <span>৳{inhandCash.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Dues (মোট বকেয়া)</p>
                <h4 className="text-4xl font-black text-orange-600">৳{(totalCustomerDue + totalSupplierDue).toLocaleString()}</h4>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Customer Due</p>
                    <p className="text-lg font-black text-orange-700">৳{totalCustomerDue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">Supplier Due</p>
                    <p className="text-lg font-black text-rose-700">৳{totalSupplierDue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[2rem]">
          <ProductionCharts />
        </div>
        <div className="glass-panel p-8 rounded-[2rem]">
          <FinancialCharts />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <Activity className="mr-3 text-indigo-500" size={24} />
              Recent Activity
            </h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Latest Records</span>
          </div>
          <div className="p-8 space-y-6">
            {[...state.sales].reverse().slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center group">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4 group-hover:scale-110 transition-transform">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Sale to {s.customerName}</p>
                    <p className="text-sm text-slate-500 font-bold">{s.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 text-lg">+৳{s.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-tighter">{s.quantity} kg</p>
                </div>
              </div>
            ))}
            {[...state.purchases].reverse().slice(0, 3).map(p => (
              <div key={p.id} className="flex justify-between items-center group">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mr-4 group-hover:scale-110 transition-transform">
                    <ArrowDownRight size={24} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Purchase from {p.supplierName}</p>
                    <p className="text-sm text-slate-500 font-bold">{p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-rose-600 text-lg">-৳{p.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-tighter">{p.quantity} kg</p>
                </div>
              </div>
            ))}
            {state.sales.length === 0 && state.purchases.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-slate-300" size={40} />
                </div>
                <p className="text-slate-400 font-bold italic">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900">Financial Summary</h3>
            <p className="text-slate-500 text-sm font-medium">Overall performance overview</p>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                  <span className="text-slate-600 font-bold">Total Revenue</span>
                </div>
                <span className="font-black text-slate-900">৳{(totalSales || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mr-3" />
                  <span className="text-slate-600 font-bold">Total Purchases</span>
                </div>
                <span className="font-black text-rose-500">-৳{(totalPurchases || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-3" />
                  <span className="text-slate-600 font-bold">Total Expenses</span>
                </div>
                <span className="font-black text-rose-500">-৳{(totalExpenses || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Net Profit</p>
                  <h4 className={`text-4xl font-black ${(netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ৳{(netProfit || 0).toLocaleString()}
                  </h4>
                </div>
                <div className={`px-4 py-2 rounded-2xl font-black text-sm ${(netProfit || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {(netProfit / (totalSales || 1) * 100).toFixed(1)}% Margin
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div 
    className="glass-panel p-6 rounded-3xl flex items-center group cursor-default"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 mr-5 group-hover:rotate-6 transition-transform`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  </div>
);
