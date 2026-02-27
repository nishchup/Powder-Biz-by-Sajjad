import React from 'react';
import { useAppStore } from '../store';
import { Package, Sun, TrendingUp, Wallet, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, wetStock, dryStock } = useAppStore();

  const totalPurchases = state.purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSales = state.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - (totalPurchases + totalExpenses);

  const totalPurchasesPaid = state.purchases.reduce((sum, p) => sum + (p.paidAmount !== undefined ? p.paidAmount : p.totalCost), 0);
  const totalSalesPaid = state.sales.reduce((sum, s) => sum + (s.paidAmount !== undefined ? s.paidAmount : s.totalRevenue), 0);
  const totalSupplierPayments = state.supplierPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCustomerPayments = state.customerPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalLoans = state.loans.reduce((sum, l) => sum + l.amount, 0);

  const inhandCash = (state.initialCapital || 0) + totalSalesPaid + totalCustomerPayments - totalPurchasesPaid - totalSupplierPayments - totalExpenses - totalLoans;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Wet Powder Stock" 
          value={`${(wetStock || 0).toFixed(2)} kg`} 
          icon={Package} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Dry Powder Stock" 
          value={`${(dryStock || 0).toFixed(2)} kg`} 
          icon={Sun} 
          color="bg-yellow-100 text-yellow-600" 
        />
        <StatCard 
          title="Total Sales" 
          value={`৳${(totalSales || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Inhand Cash" 
          value={`৳${(inhandCash || 0).toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-indigo-100 text-indigo-600" 
        />
        <StatCard 
          title="Net Profit" 
          value={`৳${(netProfit || 0).toLocaleString()}`} 
          icon={Wallet} 
          color={(netProfit || 0) >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
          <div className="space-y-4">
            {state.sales.slice(-3).map(s => (
              <div key={s.id} className="flex justify-between items-center pb-3 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-800">Sale to {s.customerName}</p>
                  <p className="text-sm text-gray-500">{s.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+৳{s.totalRevenue}</p>
                  <p className="text-sm text-gray-500">{s.quantity} kg</p>
                </div>
              </div>
            ))}
            {state.purchases.slice(-3).map(p => (
              <div key={p.id} className="flex justify-between items-center pb-3 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-800">Purchase from {p.supplierName}</p>
                  <p className="text-sm text-gray-500">{p.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">-৳{p.totalCost}</p>
                  <p className="text-sm text-gray-500">{p.quantity} kg</p>
                </div>
              </div>
            ))}
            {state.sales.length === 0 && state.purchases.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-800">৳{(totalSales || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Purchases</span>
              <span className="font-semibold text-red-500">-৳{(totalPurchases || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-semibold text-red-500">-৳{(totalExpenses || 0).toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-800">Net Profit</span>
              <span className={`font-bold text-xl ${(netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳{(netProfit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`p-4 rounded-lg ${color} mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);
