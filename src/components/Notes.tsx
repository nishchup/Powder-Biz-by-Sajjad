import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, StickyNote, Calendar } from 'lucide-react';
import { useTranslation } from '../translations';

export const Notes: React.FC = () => {
  const { state, addNote, editNote, deleteNote } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
  });

  const handleEdit = (note: any) => {
    setFormData({
      date: note.date,
      title: note.title,
      content: note.content,
    });
    setEditingId(note.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      title: '', 
      content: '' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.content) {
      if (editingId) {
        editNote(editingId, formData);
      } else {
        addNote(formData);
      }
      handleCancel();
    }
  };

  // Sort notes by date descending
  const sortedNotes = [...state.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('notes')}</h2>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm font-medium w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2" />
            {t('addNote')}
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? t('editNote') : t('addNote')}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('date')}</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('title')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Note title..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('content')}</label>
              <textarea 
                required
                rows={4}
                placeholder="Write your note here..."
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <StickyNote className="text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No notes found.</p>
              <p className="text-slate-400 text-sm mt-1">Add your first note to keep track of important information.</p>
            </div>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <Calendar size={12} className="mr-1" />
                    {note.date}
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-2 line-clamp-1">{note.title}</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-4">{note.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
