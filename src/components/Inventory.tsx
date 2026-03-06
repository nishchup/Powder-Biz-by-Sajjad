import * as React from 'react';
import { useMemo } from 'react';
import { useAppStore } from '../store';
import { Package, Sun, ArrowDownRight, ArrowUpRight, Printer, History } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';
import { motion } from 'motion/react';

export const Inventory: React.FC = () => {
  const { state, wetStock, dryStock } = useAppStore();
  const t = useTranslation(state.language);

  const stockMovements = useMemo(() => {
    const movements: any[] = [];

    state.purchases.forEach(p => {
      movements.push({
        id: p.id,
        date: p.date,
        type: 'purchase',
        stockType: p.type || 'wet',
        quantity: p.quantity,
        description: `Purchase from ${p.supplierName}`,
        isAddition: true,
      });
    });

    state.sales.forEach(s => {
      movements.push({
        id: s.id,
        date: s.date,
        type: 'sale',
        stockType: 'dry',
        quantity: s.quantity,
        description: `Sale to ${s.customerName}`,
        isAddition: false,
      });
    });

    state.conversions.forEach(c => {
      movements.push({
        id: `${c.id}-out`,
        date: c.date,
        type: 'conversion_out',
        stockType: 'wet',
        quantity: c.wetQuantityUsed,
        description: 'Used for drying',
        isAddition: false,
      });
      movements.push({
        id: `${c.id}-in`,
        date: c.date,
        type: 'conversion_in',
        stockType: 'dry',
        quantity: c.dryQuantityProduced,
        description: 'Produced from drying',
        isAddition: true,
      });
    });

    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.purchases, state.sales, state.conversions]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8" 
      id="inventory-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inventory & Stock</h2>
          <p className="text-slate-500 font-medium">Track your raw materials and finished products.</p>
        </div>
        <button 
          onClick={() => exportToPDF('inventory-content', 'inventory-report.pdf')}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-slate-200 font-bold print:hidden w-full sm:w-auto active:scale-95"
        >
          <Printer size={20} className="mr-2" />
          Export Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group">
          <div className="w-20 h-20 bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-blue-600 mr-8 group-hover:scale-110 transition-transform">
            <Package size={40} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Wet Powder Stock</p>
            <p className="text-4xl font-black text-slate-900">
              {(wetStock || 0).toFixed(2)} <span className="text-xl font-bold text-slate-400">kg</span>
            </p>
          </div>
        </motion.div>
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group">
          <div className="w-20 h-20 bg-amber-100 rounded-[1.5rem] flex items-center justify-center text-amber-600 mr-8 group-hover:scale-110 transition-transform">
            <Sun size={40} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Dry Powder Stock</p>
            <p className="text-4xl font-black text-slate-900">
              {(dryStock || 0).toFixed(2)} <span className="text-xl font-bold text-slate-400">kg</span>
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 flex items-center">
            <History className="mr-3 text-indigo-500" size={24} />
            Stock Movement History
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Full Audit Trail</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">
                    No stock movements found.
                  </td>
                </tr>
              ) : (
                stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">{movement.date}</td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        movement.stockType === 'wet' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {movement.stockType === 'wet' ? 'Wet Powder' : 'Dry Powder'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-extrabold text-slate-900">{movement.description}</td>
                    <td className="px-8 py-4 text-right whitespace-nowrap">
                      <div className={`flex items-center justify-end font-black text-lg ${
                        movement.isAddition ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {movement.isAddition ? <ArrowUpRight size={18} className="mr-1" /> : <ArrowDownRight size={18} className="mr-1" />}
                        {movement.isAddition ? '+' : '-'}{movement.quantity.toFixed(2)} <span className="text-xs ml-1 font-bold opacity-60">kg</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
