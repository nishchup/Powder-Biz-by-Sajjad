import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, AlertCircle, Clock, Pencil, X } from 'lucide-react';
import { useTranslation } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from './ConfirmModal';

export const Tasks: React.FC = () => {
  const { state, addTask, editTask, toggleTask, deleteTask } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (editingId) {
        editTask(editingId, {
          title: formData.title,
          priority: formData.priority,
          date: formData.date,
          completed: state.tasks.find(t => t.id === editingId)?.completed || false
        });
      } else {
        addTask({
          title: formData.title,
          priority: formData.priority,
          date: formData.date,
          completed: false
        });
      }
      handleCloseForm();
    }
  };

  const handleEdit = (task: any) => {
    setFormData({
      title: task.title,
      priority: task.priority,
      date: task.date
    });
    setEditingId(task.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormData({ title: '', priority: 'medium', date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const sortedTasks = [...state.tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'low': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daily Tasks</h2>
          <p className="text-slate-500 font-medium">Manage your daily operations and priorities.</p>
        </div>
        <button 
          onClick={() => {
            handleCloseForm();
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center transition-all shadow-lg shadow-indigo-100 font-bold w-full sm:w-auto justify-center active:scale-95"
        >
          <Plus size={24} className="mr-2" />
          Add Task
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-8 rounded-[2rem] border-indigo-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{editingId ? 'Edit Task' : 'Add New Task'}</h3>
                <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Task Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="What needs to be done?"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95"
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {sortedTasks.length === 0 ? (
          <motion.div variants={item} className="glass-panel rounded-[2.5rem] p-24 text-center border-dashed border-slate-200">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <Clock className="text-slate-200" size={48} />
              </div>
              <p className="text-2xl font-black text-slate-900">No tasks for today</p>
              <p className="text-slate-400 font-medium mt-2">Add your first task to stay organized.</p>
            </div>
          </motion.div>
        ) : (
          sortedTasks.map(task => (
            <motion.div 
              key={task.id} 
              variants={item}
              layout
              className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                task.completed 
                  ? 'bg-slate-50/50 border-slate-100 grayscale opacity-60' 
                  : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`transition-all transform active:scale-75 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                >
                  {task.completed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                </button>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Calendar size={12} className="mr-1.5" />
                      {task.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEdit(task)}
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                  title="Edit Task"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => setDeleteId(task.id)}
                  className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
                  title="Delete Task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteTask(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </motion.div>
  );
};
