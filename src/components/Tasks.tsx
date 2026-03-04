import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, AlertCircle, Clock, Edit2 } from 'lucide-react';
import { useTranslation } from '../translations';

export const Tasks: React.FC = () => {
  const { state, addTask, editTask, toggleTask, deleteTask } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Operations Tasks</h2>
        <button 
          onClick={() => {
            handleCloseForm();
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add Task
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Task' : 'Add New Task'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Description</label>
              <input 
                type="text" 
                required
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button 
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Clock className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-medium">No tasks for today. Add one to get started!</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 bg-white rounded-xl border transition-all duration-200 ${
                task.completed ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500'}`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h3 className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center text-xs text-slate-400">
                      <Calendar size={12} className="mr-1" />
                      {task.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(task)}
                  className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                  title="Edit Task"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Delete Task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
