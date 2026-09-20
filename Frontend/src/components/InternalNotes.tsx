import React, { useState } from 'react';
import { Lock, Send, User } from 'lucide-react';
import { Button, Card, Label } from './UI';
import { complaintApi } from '../services/complaintApi';
import { InternalNote } from '../types';

interface InternalNotesProps {
  complaintId: string;
  notes?: InternalNote[];
  onNoteAdded?: () => void;
}

export const InternalNotes: React.FC<InternalNotesProps> = ({
  complaintId,
  notes = [],
  onNoteAdded,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await complaintApi.addInternalNote(complaintId, newNote);
      setNewNote('');
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add internal note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 border-slate-200 bg-slate-50/50">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>Internal Staff Notes</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Staff / HOD / Admin Only
        </span>
      </div>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
        {notes && notes.length > 0 ? (
          notes.map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{typeof item.author === 'object' ? item.author?.name || 'Staff' : 'Staff'}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                    {item.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">{item.note}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic py-2 text-center">No internal notes added yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <div>
          <Label htmlFor="internal-note-text" className="text-xs text-slate-600">
            Add Internal Note
          </Label>
          <textarea
            id="internal-note-text"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:ring-2 focus:ring-slate-400 outline-none"
            placeholder="Write private notes for department staff..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" isLoading={isSubmitting} className="w-full">
          Add Note
          <Send className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </form>
    </Card>
  );
};
