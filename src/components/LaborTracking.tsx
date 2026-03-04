import React, { useState } from 'react';
import { useAppStore, LaborRecord } from '../store';
import { Plus, Trash2, Edit2, Clock, User, Briefcase, DollarSign, Calendar, Search, Filter } from 'lucide-react';
import { useTranslation } from '../translations';

export const LaborTracking: React.FC = () => {
  const { state, addLaborRecord, editLaborRecord, deleteLaborRecord } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState('All');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workerName: '',
    processName: 'Drying',
    hours: 0,
    hourlyRate: 0,
    notes: ''
  });

  const processes = ['Drying', 'Packaging', 'Loading', 'Maintenance', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = formData.hours * formData.hourlyRate;
    const record = { ...formData, totalCost };

    if (editingId) {
      editLaborRecord(editingId, record);
    } else {
      addLaborRecord(record);
    }
    handleCloseForm();
  };

  const handleEdit = (record: LaborRecord) => {
    setFormData({
      date: record.date,
      workerName: record.workerName,
      processName: record.processName,
      hours: record.hours,
      hourlyRate: record.hourlyRate,
      notes: record.notes
    });
    setEditingId(record.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      workerName: '',
      processName: 'Drying',
      hours: 0,
      hourlyRate: 0,
      notes: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredRecords = state.laborRecords.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProcess = processFilter === 'All' || record.processName === processFilter;
    return matchesSearch && matchesProcess;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalLaborCost = filteredRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalHours = filteredRecords.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Labor Tracking</h2>
          <p className="text-slate-500 text-sm">Monitor labor hours and costs across production processes</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors shadow-sm font-medium w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" />
          Add Labor Entry
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 text-sm mb-1">
            <Clock size={16} className="mr-2" />
            Total Hours
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalHours.toFixed(1)} hrs</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 text-sm mb-1">
            <DollarSign size={16} className="mr-2 text-emerald-500" />
            Total Labor Cost
          </div>
          <div className="text-2xl font-bold text-emerald-600">৳{totalLaborCost.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 text-sm mb-1">
            <Briefcase size={16} className="mr-2 text-blue-500" />
            Avg. Hourly Rate
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ৳{totalHours > 0 ? (totalLaborCost / totalHours).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Labor Entry' : 'New Labor Entry'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Worker Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter name"
                  value={formData.workerName}
                  onChange={e => setFormData({...formData, workerName: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Process</label>
                <select 
                  value={formData.processName}
                  onChange={e => setFormData({...formData, processName: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {processes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hours Worked</label>
                <input 
                  type="number" 
                  step="0.5"
                  required
                  min="0"
                  value={formData.hours || ''}
                  onChange={e => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hourly Rate (৳)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.hourlyRate || ''}
                  onChange={e => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Cost (Auto)</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-600 font-bold">
                  ৳{(formData.hours * formData.hourlyRate).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-20"
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                {editingId ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search worker or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={processFilter}
            onChange={e => setProcessFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
          >
            <option value="All">All Processes</option>
            {processes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Process</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hours</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Rate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No labor records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-slate-400" />
                        {record.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{record.workerName}</div>
                      {record.notes && <div className="text-xs text-slate-400 truncate max-w-[150px]">{record.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        {record.processName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">
                      {record.hours}h
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">
                      ৳{record.hourlyRate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                      ৳{record.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteLaborRecord(record.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
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
