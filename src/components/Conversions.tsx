import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, Sun, Printer } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { useTranslation } from '../translations';

export const Conversions: React.FC = () => {
  const { state, addConversion, editConversion, deleteConversion, wetStock } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    wetQuantityUsed: '',
    dryQuantityProduced: '',
  });

  const handleEdit = (c: any) => {
    setFormData({
      date: c.date,
      wetQuantityUsed: c.wetQuantityUsed.toString(),
      dryQuantityProduced: c.dryQuantityProduced.toString(),
    });
    setEditingId(c.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setError(null);
    setFormData({ date: new Date().toISOString().split('T')[0], wetQuantityUsed: '', dryQuantityProduced: '' });
  };

  const handleWetQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wetQty = parseFloat(e.target.value);
    if (!isNaN(wetQty)) {
      // 1 kg wet = 800g dry (200g loss) -> 80% yield
      const estimatedDry = wetQty * 0.8;
      setFormData({
        ...formData,
        wetQuantityUsed: e.target.value,
        dryQuantityProduced: estimatedDry.toFixed(2),
      });
    } else {
      setFormData({
        ...formData,
        wetQuantityUsed: e.target.value,
        dryQuantityProduced: '',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wetQty = parseFloat(formData.wetQuantityUsed);
    const dryQty = parseFloat(formData.dryQuantityProduced);
    
    if (wetQty > 0 && dryQty > 0) {
      // Check stock
      const oldWetQty = editingId ? (state.conversions.find(c => c.id === editingId)?.wetQuantityUsed || 0) : 0;
      const availableWetStock = wetStock + oldWetQty;

      if (wetQty > availableWetStock) {
        setError(`Not enough wet stock! Available: ${availableWetStock.toFixed(2)} kg`);
        return;
      }

      setError(null);
      const data = {
        date: formData.date,
        wetQuantityUsed: wetQty,
        dryQuantityProduced: dryQty,
      };

      if (editingId) {
        editConversion(editingId, data);
      } else {
        addConversion(data);
      }
      
      handleCancel();
    }
  };

  return (
    <div className="space-y-6" id="conversions-content">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('dryingProcess')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('conversions-content', 'drying-report.pdf')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
          >
            <Printer size={18} className="mr-2" />
            {t('print')}
          </button>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium"
            >
              <Plus size={20} className="mr-2" />
              Record Batch
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm text-blue-800 font-semibold mb-1">Available Wet Stock</p>
          <p className="text-3xl font-bold text-blue-900">{(wetStock || 0).toFixed(2)} <span className="text-lg font-medium">kg</span></p>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Edit Drying Batch' : 'New Drying Batch'}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wet Powder Used (kg)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.wetQuantityUsed}
                onChange={handleWetQuantityChange}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dry Powder Produced (kg)</label>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.dryQuantityProduced}
                onChange={e => setFormData({...formData, dryQuantityProduced: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">Auto-calculated at 80% yield, but can be adjusted.</p>
            </div>
            <div className="sm:col-span-3 flex justify-end space-x-3 mt-2 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Update Batch' : 'Save Batch'}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Wet Used (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Dry Produced (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Yield %</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.conversions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Sun className="text-slate-300 mb-3" size={48} />
                      <p className="text-base font-medium">No drying batches recorded yet.</p>
                      <p className="text-sm mt-1">Click "Record Batch" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.conversions.map((c) => {
                  const yieldPercent = (c.dryQuantityProduced / c.wetQuantityUsed) * 100;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-700">{c.date}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold text-right">{(c.wetQuantityUsed || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-yellow-600 font-semibold text-right">{(c.dryQuantityProduced || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          yieldPercent >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(yieldPercent || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center print:hidden">
                        <div className="flex items-center justify-center space-x-2 transition-opacity">
                          <button 
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteConversion(c.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
