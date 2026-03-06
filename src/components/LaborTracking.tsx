import React, { useState } from 'react';
import { useAppStore, LaborRecord } from '../store';
import { getTodayDate } from '../utils/dateUtils';
import { Plus, Trash2, Pencil, Clock, User, Briefcase, DollarSign, Calendar, Search, Filter, X, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useTranslation } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from './ConfirmModal';

export const LaborTracking: React.FC = () => {
  const { state, addLaborRecord, editLaborRecord, deleteLaborRecord } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: getTodayDate(),
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
      date: getTodayDate(),
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
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Labor Tracking</h2>
          <p className="text-slate-500 font-medium">Monitor labor hours and costs across production processes.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center transition-all shadow-lg shadow-indigo-100 font-bold w-full sm:w-auto justify-center active:scale-95"
        >
          <Plus size={24} className="mr-2" />
          Add Labor Entry
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-6 group-hover:scale-110 transition-transform">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Hours</p>
            <p className="text-3xl font-black text-slate-900">{totalHours.toFixed(1)} <span className="text-sm font-bold text-slate-400">hrs</span></p>
          </div>
        </motion.div>
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mr-6 group-hover:scale-110 transition-transform">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-3xl font-black text-emerald-600">৳{totalLaborCost.toLocaleString()}</p>
          </div>
        </motion.div>
        <motion.div variants={item} className="glass-panel p-8 rounded-[2rem] flex items-center group">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mr-6 group-hover:scale-110 transition-transform">
            <Briefcase size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Rate</p>
            <p className="text-3xl font-black text-indigo-600">
              ৳{totalHours > 0 ? (totalLaborCost / totalHours).toFixed(0) : '0'}
              <span className="text-sm font-bold text-slate-400">/hr</span>
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingId ? 'Edit Labor Entry' : 'New Labor Entry'}
                  </h3>
                  <p className="text-slate-500 font-medium">Record worker hours and process details</p>
                </div>
                <button onClick={handleCloseForm} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Worker Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter name"
                        value={formData.workerName}
                        onChange={e => setFormData({...formData, workerName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Process</label>
                      <select 
                        value={formData.processName}
                        onChange={e => setFormData({...formData, processName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                      >
                        {processes.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hours Worked</label>
                      <input 
                        type="number" 
                        step="0.5"
                        required
                        min="0"
                        value={formData.hours || ''}
                        onChange={e => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hourly Rate (৳)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={formData.hourlyRate || ''}
                        onChange={e => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Cost</p>
                        <p className="text-2xl font-black text-indigo-700">
                          ৳{(formData.hours * formData.hourlyRate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 h-24 custom-scrollbar"
                      placeholder="Optional notes..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={handleCloseForm}
                      className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white px-10 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95"
                    >
                      {editingId ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search worker or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center text-slate-500 font-bold shadow-sm">
            <Filter size={20} className="mr-3 text-slate-400" />
            <select 
              value={processFilter}
              onChange={e => setProcessFilter(e.target.value)}
              className="bg-transparent outline-none text-sm uppercase tracking-widest cursor-pointer"
            >
              <option value="All">All Processes</option>
              {processes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <motion.div variants={item} className="glass-panel rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 flex items-center">
            <History className="mr-3 text-indigo-500" size={24} />
            Labor Records
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Entries: {filteredRecords.length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Worker</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Process</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Hours</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <User className="text-slate-200" size={48} />
                      </div>
                      <p className="text-xl font-black text-slate-900">No labor entries found</p>
                      <p className="text-slate-400 font-medium mt-1">Start by recording your first labor activity.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-slate-300" />
                        {record.date}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-900">{record.workerName}</div>
                      {record.notes && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px]">{record.notes}</div>}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {record.processName}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-900 text-center font-black">
                      {record.hours} <span className="text-[10px] opacity-40">hrs</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 text-right font-bold">
                      ৳{record.hourlyRate.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">
                      ৳{record.totalCost.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(record.id)}
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteLaborRecord(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Labor Entry"
        message="Are you sure you want to delete this labor entry? This action cannot be undone."
      />
    </motion.div>
  );
};
