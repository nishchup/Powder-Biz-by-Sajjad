import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { Package, Sun, ArrowDownRight, ArrowUpRight, Printer } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';

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

  return (
    <div className="space-y-6" id="inventory-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory & Stock</h2>
        <button 
          onClick={() => exportToPDF('inventory-content', 'inventory-report.pdf')}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium print:hidden w-full sm:w-auto"
        >
          <Printer size={18} className="mr-2" />
          Print Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="bg-blue-100 p-4 rounded-full mr-6">
            <Package className="text-blue-600" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Wet Powder Stock</p>
            <p className="text-3xl font-bold text-slate-800">{(wetStock || 0).toFixed(2)} <span className="text-lg font-medium text-slate-500">kg</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="bg-yellow-100 p-4 rounded-full mr-6">
            <Sun className="text-yellow-600" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Dry Powder Stock</p>
            <p className="text-3xl font-bold text-slate-800">{(dryStock || 0).toFixed(2)} <span className="text-lg font-medium text-slate-500">kg</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Stock Movement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No stock movements found.
                  </td>
                </tr>
              ) : (
                stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-800 whitespace-nowrap">{movement.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        movement.stockType === 'wet' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {movement.stockType === 'wet' ? 'Wet Powder' : 'Dry Powder'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{movement.description}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className={`flex items-center justify-end font-medium ${
                        movement.isAddition ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {movement.isAddition ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {movement.isAddition ? '+' : '-'}{movement.quantity.toFixed(2)} kg
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
