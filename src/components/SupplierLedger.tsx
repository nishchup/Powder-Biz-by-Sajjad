import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Search, Filter, Calendar, Printer, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, History, User, DollarSign } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';

export const SupplierLedger: React.FC = () => {
  const { state } = useAppStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const ledgerData = useMemo(() => {
    if (!selectedSupplier) return [];

    const purchases = state.purchases
      .filter(p => p.supplierName === selectedSupplier)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: 'Purchase',
        description: `${p.type === 'dry' ? 'Dry' : 'Wet'} Powder (${p.quantity}kg @ ৳${p.pricePerKg})`,
        debit: 0,
        credit: p.totalCost, // Increases what we owe
        ref: `PR-${p.id.substring(0, 6).toUpperCase()}`
      }));

    const payments = state.supplierPayments
      .filter(p => p.supplierName === selectedSupplier)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: 'Payment',
        description: p.description || 'Payment to Supplier',
        debit: p.amount, // Decreases what we owe
        credit: 0,
        ref: `PY-${p.id.substring(0, 6).toUpperCase()}`
      }));

    // Also include initial payments made at time of purchase
    const purchaseInitialPayments = state.purchases
      .filter(p => p.supplierName === selectedSupplier && p.paidAmount && p.paidAmount > 0)
      .map(p => ({
        id: `init-${p.id}`,
        date: p.date,
        type: 'Initial Payment',
        description: `Payment at purchase (${p.id.substring(0, 6).toUpperCase()})`,
        debit: p.paidAmount || 0,
        credit: 0,
        ref: `PR-${p.id.substring(0, 6).toUpperCase()}`
      }));

    const combined = [...purchases, ...payments, ...purchaseInitialPayments]
      .filter(item => {
        if (startDate && item.date < startDate) return false;
        if (endDate && item.date > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance (Credit - Debit)
    let balance = 0;
    return combined.map(item => {
      balance += (item.credit - item.debit);
      return { ...item, balance };
    });
  }, [state.purchases, state.supplierPayments, selectedSupplier, startDate, endDate]);

  const totals = useMemo(() => {
    return ledgerData.reduce((acc, curr) => ({
      debit: acc.debit + curr.debit,
      credit: acc.credit + curr.credit
    }), { debit: 0, credit: 0 });
  }, [ledgerData]);

  const paginatedData = useMemo(() => {
    const sorted = [...ledgerData].reverse(); // Show newest first for the table
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [ledgerData, currentPage]);

  const totalPages = Math.ceil(ledgerData.length / itemsPerPage);

  return (
    <div className="space-y-8" id="supplier-ledger-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Supplier Ledger</h2>
          <p className="text-slate-500 font-medium">Track all purchases and payments for each supplier.</p>
        </div>
        <button 
          onClick={() => exportToPDF('supplier-ledger-content', `ledger-${selectedSupplier || 'all'}.pdf`)}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg font-bold active:scale-95 print:hidden"
        >
          <Printer size={20} className="mr-2" />
          Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        <div className="lg:col-span-2 space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Supplier</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              value={selectedSupplier}
              onChange={(e) => { setSelectedSupplier(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none"
            >
              <option value="">Choose a supplier...</option>
              {state.suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
          />
        </div>
      </div>

      {!selectedSupplier ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-indigo-400" size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Select a Supplier</h3>
          <p className="text-slate-500 font-medium mt-2">Choose a supplier from the dropdown above to view their full transaction history.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Billed (Purchases)</p>
              <p className="text-3xl font-black text-slate-900">৳{totals.credit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Paid (Transactions)</p>
              <p className="text-3xl font-black text-emerald-600">৳{totals.debit.toLocaleString()}</p>
            </div>
            <div className={`p-8 rounded-[2rem] border shadow-sm ${totals.credit - totals.debit > 0 ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${totals.credit - totals.debit > 0 ? 'text-rose-400' : 'text-indigo-400'}`}>
                {totals.credit - totals.debit > 0 ? 'Current Due' : 'Current Advance'}
              </p>
              <p className={`text-3xl font-black ${totals.credit - totals.debit > 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                ৳{Math.abs(totals.credit - totals.debit).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                <History className="mr-3 text-indigo-500" size={24} />
                Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Reference</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Debit (৳)</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Credit (৳)</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Balance (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-24 text-center text-slate-400 font-bold italic">No transactions found for this period.</td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.date}</td>
                        <td className="px-8 py-5 text-sm">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.type === 'Purchase' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-indigo-600">{item.ref}</td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600 max-w-xs truncate">{item.description}</td>
                        <td className="px-8 py-5 text-sm text-right font-black text-rose-600">
                          {item.credit > 0 ? `৳${item.credit.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-8 py-5 text-sm text-right font-black text-emerald-600">
                          {item.debit > 0 ? `৳${item.debit.toLocaleString()}` : '—'}
                        </td>
                        <td className={`px-8 py-5 text-sm text-right font-black ${item.balance > 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                          ৳{Math.abs(item.balance).toLocaleString()}
                          <span className="ml-1 text-[10px] uppercase opacity-50">
                            {item.balance > 0 ? 'Cr' : 'Dr'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-900 text-white">
                  <tr>
                    <td colSpan={4} className="px-8 py-6 text-sm font-black uppercase tracking-widest">Period Totals</td>
                    <td className="px-8 py-6 text-right font-black text-rose-400">৳{totals.credit.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right font-black text-emerald-400">৳{totals.debit.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right font-black">
                      ৳{Math.abs(totals.credit - totals.debit).toLocaleString()}
                      <span className="ml-1 text-[10px] uppercase opacity-70">
                        {totals.credit - totals.debit > 0 ? 'Cr' : 'Dr'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 print:hidden">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition-all active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition-all active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
