import * as React from 'react';
import { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon,
  ShoppingBag,
  Briefcase,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { useAppStore, Reminder } from '../store';
import { format } from 'date-fns';

export function Reminders() {
  const { state, addReminder, editReminder, deleteReminder, toggleReminder, language } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState<Omit<Reminder, 'id' | 'completed' | 'notified'>>({
    title: '',
    time: format(new Date(), 'HH:mm'),
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'work'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title) return;
    
    if (editingId) {
      const existing = state.reminders.find(r => r.id === editingId);
      editReminder(editingId, {
        ...newReminder,
        completed: existing?.completed || false,
        notified: existing?.notified || false
      });
    } else {
      addReminder({
        ...newReminder,
        completed: false,
        notified: false
      });
    }
    
    handleCloseModal();
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setNewReminder({
      title: reminder.title,
      time: reminder.time,
      date: reminder.date,
      type: reminder.type
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setNewReminder({
      title: '',
      time: format(new Date(), 'HH:mm'),
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'work'
    });
  };

  const t = {
    en: {
      title: 'Reminders',
      add: 'Add Reminder',
      edit: 'Edit Reminder',
      noReminders: 'No reminders set',
      work: 'Work',
      shopping: 'Shopping',
      other: 'Other',
      save: 'Save Reminder',
      update: 'Update Reminder',
      cancel: 'Cancel',
      placeholder: 'What needs to be remembered?',
      time: 'Time',
      date: 'Date',
      type: 'Type'
    },
    bn: {
      title: 'রিমাইন্ডার',
      add: 'রিমাইন্ডার যোগ করুন',
      edit: 'রিমাইন্ডার সম্পাদনা করুন',
      noReminders: 'কোন রিমাইন্ডার নেই',
      work: 'কাজ',
      shopping: 'কেনাকাটা',
      other: 'অন্যান্য',
      save: 'রিমাইন্ডার সংরক্ষণ করুন',
      update: 'রিমাইন্ডার আপডেট করুন',
      cancel: 'বাতিল',
      placeholder: 'কি মনে রাখতে হবে?',
      time: 'সময়',
      date: 'তারিখ',
      type: 'ধরণ'
    }
  }[language || 'en'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return <Briefcase size={16} />;
      case 'shopping': return <ShoppingBag size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-600';
      case 'shopping': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-indigo-600" />
            {t.title}
          </h1>
          <p className="text-slate-500 text-sm">Manage your tasks and shopping lists</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{t.add}</span>
        </button>
      </div>

      <div className="grid gap-4">
        {state.reminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">{t.noReminders}</p>
          </div>
        ) : (
          state.reminders
            .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
            .map((reminder) => (
            <div 
              key={reminder.id}
              className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${reminder.completed ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => toggleReminder(reminder.id)}
                className={`transition-colors ${reminder.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
              >
                {reminder.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-slate-800 truncate ${reminder.completed ? 'line-through text-slate-400' : ''}`}>
                  {reminder.title}
                </h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarIcon size={12} />
                    {reminder.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} />
                    {reminder.time}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTypeColor(reminder.type)}`}>
                    {getTypeIcon(reminder.type)}
                    {t[reminder.type as keyof typeof t]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleEdit(reminder)}
                  className="text-slate-300 hover:text-indigo-500 p-2 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-slate-300 hover:text-rose-500 p-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingId ? t.edit : t.add}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.placeholder}</label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
                  placeholder={t.placeholder}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
                  <input
                    type="date"
                    required
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.time}</label>
                  <input
                    type="time"
                    required
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.type}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['work', 'shopping', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewReminder({ ...newReminder, type })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newReminder.type === type 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {t[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  {editingId ? t.update : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
