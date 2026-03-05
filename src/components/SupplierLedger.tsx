import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Search, Filter, Printer, Calendar, User, ArrowUpCircle, ShoppingCart, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';

export const SupplierLedger: React.FC = () => {
  const { state } = useAppStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const suppliers = state.suppliers;

  const ledgerData = useMemo(() => {
    if (!selectedSupplier) return [];

    const purchases = state.purchases
      .filter(p => p.supplierName === selectedSupplier)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: 'Purchase',
        description: `${p.type === 'dry' ? 'Dry' : 'Wet'} Powder (${p.quantity}kg @ ৳${p.pricePerKg})`,
        debit: p.totalCost, // What we owe
        credit: p.paidAmount || 0, // What we paid during purchase
        reference: `PR-${p.id.substring(0, 6).toUpperCase()}`
      }));

    const payments = state.supplierPayments
      .filter(p => p.supplierName === selectedSupplier)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: 'Payment',
        description: p.purchaseId 
          ? `${p.remarks || 'Due Payment'} (Ref: PR-${p.purchaseId.substring(0, 6).toUpperCase()})`
          : p.remarks || 'Supplier Payment',
        debit: 0,
        credit: p.amount,
        reference: `PY-${p.id.substring(0, 6).toUpperCase()}`
      }));

    const combined = [...purchases, ...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by date
    return combined.filter(item => {
      if (dateRange.start && item.date < dateRange.start) return false;
      if (dateRange.end && item.date > dateRange.end) return false;
      return true;
    });
  }, [state.purchases, state.supplierPayments, selectedSupplier, dateRange]);

  const totals = useMemo(() => {
    return ledgerData.reduce((acc, item) => ({
      debit: acc.debit + item.debit,
      credit: acc.credit + item.credit
    }), { debit: 0, credit: 0 });
  }, [ledgerData]);

  const balance = totals.debit - totals.credit;

  return (
    <div className="space-y-8" id="supplier-ledger-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Supplier Ledger</h2>
          <p className="text-slate-500 font-medium">Track all purchases and payments for each supplier.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('supplier-ledger-content', `ledger-${selectedSupplier || 'all'}.pdf`)}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print Ledger
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <User size={14} className="mr-2" /> Select Supplier
          </label>
          <select 
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
          >
            <option value="">Choose a supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Calendar size={14} className="mr-2" /> Date Range Filter
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
            />
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {selectedSupplier ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Purchases</p>
              <p className="text-3xl font-black text-slate-900">৳{totals.debit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-3xl font-black text-emerald-600">৳{totals.credit.toLocaleString()}</p>
            </div>
            <div className={`p-8 rounded-[2rem] border shadow-sm ${balance > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {balance > 0 ? 'Total Due' : 'Payment Balance'}
              </p>
              <p className={`text-3xl font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ৳{Math.abs(balance).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Reference</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Debit (Owed)</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Credit (Paid)</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-xl font-black text-slate-900">No transactions found</p>
                          <p className="text-slate-400 font-medium mt-1">Try adjusting your date filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      let runningBalance = 0;
                      return ledgerData.map((item) => {
                        runningBalance += (item.debit - item.credit);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.date}</td>
                            <td className="px-8 py-5 text-sm">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === 'Purchase' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-sm font-black text-slate-400">{item.reference}</td>
                            <td className="px-8 py-5 text-sm font-medium text-slate-700">{item.description}</td>
                            <td className="px-8 py-5 text-sm text-right font-black text-slate-900">
                              {item.debit > 0 ? `৳${item.debit.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-8 py-5 text-sm text-right font-black text-emerald-600">
                              {item.credit > 0 ? `৳${item.credit.toLocaleString()}` : '—'}
                            </td>
                            <td className={`px-8 py-5 text-sm text-right font-black ${runningBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              ৳{Math.abs(runningBalance).toLocaleString()} {runningBalance > 0 ? '(Dr)' : '(Cr)'}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
                {ledgerData.length > 0 && (
                  <tfoot className="bg-slate-50/50 font-black">
                    <tr>
                      <td colSpan={4} className="px-8 py-6 text-right text-slate-500 uppercase tracking-widest text-xs">Period Totals</td>
                      <td className="px-8 py-6 text-right text-slate-900">৳{totals.debit.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right text-emerald-600">৳{totals.credit.toLocaleString()}</td>
                      <td className={`px-8 py-6 text-right ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ৳{Math.abs(balance).toLocaleString()} {balance > 0 ? '(Dr)' : '(Cr)'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-24 text-center border border-dashed border-slate-300">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-slate-200" size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Select a Supplier</h3>
          <p className="text-slate-500 font-medium mt-2">Choose a supplier from the dropdown above to view their full transaction history and ledger.</p>
        </div>
      )}
    </div>
  );
};
