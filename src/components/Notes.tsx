import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Pencil, X, StickyNote, Calendar, Printer, History, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../translations';
import { exportToPDF } from '../services/pdfService';
import { motion, AnimatePresence } from 'framer-motion';

export const Notes: React.FC = () => {
  const { state, addNote, editNote, deleteNote } = useAppStore();
  const t = useTranslation(state.language);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const filteredNotes = state.notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      id="notes-content"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notes</h2>
          <p className="text-slate-500 font-medium">Capture ideas, reminders, and important information.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto print:hidden">
          <button 
            onClick={() => exportToPDF('notes-content', 'notes-report.pdf')}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-100 font-bold active:scale-95"
          >
            <Plus size={24} className="mr-2" />
            Add Note
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 shadow-sm"
          />
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingId ? 'Edit Note' : 'New Note'}
                  </h3>
                  <p className="text-slate-500 font-medium">Write down your thoughts</p>
                </div>
                <button onClick={handleCancel} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Note title..."
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                    <textarea 
                      required
                      rows={8}
                      placeholder="Write your note here..."
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 resize-none custom-scrollbar"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-slate-900 hover:bg-black text-white font-black px-10 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      {editingId ? 'Update Note' : 'Save Note'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedNotes.length === 0 ? (
          <motion.div variants={item} className="col-span-full glass-panel rounded-[2.5rem] p-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <StickyNote className="text-slate-200" size={48} />
              </div>
              <p className="text-2xl font-black text-slate-900">No notes found</p>
              <p className="text-slate-400 font-medium mt-2">Capture your first business note today.</p>
            </div>
          </motion.div>
        ) : (
          sortedNotes.map((note) => (
            <motion.div 
              key={note.id} 
              variants={item}
              className="glass-panel rounded-[2rem] overflow-hidden flex flex-col group hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <Calendar size={12} className="mr-1.5" />
                    {note.date}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(note)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center active:scale-90"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4 line-clamp-1">{note.title}</h4>
                <p className="text-slate-500 font-medium text-sm whitespace-pre-wrap line-clamp-6 flex-1 leading-relaxed">{note.content}</p>
              </div>
              <div className="h-2 bg-indigo-500/10 group-hover:bg-indigo-500 transition-colors"></div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
