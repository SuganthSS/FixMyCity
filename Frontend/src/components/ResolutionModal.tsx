import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Card, Label, Input } from './UI';
import { complaintApi } from '../services/complaintApi';

interface ResolutionModalProps {
  complaintId: string;
  isOpen: boolean;
  onClose: () => void;
  onResolvedSuccess: () => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onResolvedSuccess,
}) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNotes.trim()) {
      setError('Completion notes are required.');
      return;
    }
    if (!imageFile) {
      setError('At least one resolution proof image is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('stage', 'RESOLVED');
      formData.append('completionNotes', completionNotes);
      formData.append('images', imageFile);

      await complaintApi.updateStage(complaintId, formData);
      onResolvedSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint stage to RESOLVED.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg p-6 space-y-6 bg-white relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Resolve Complaint
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="completion-notes" className="required">
              Completion Notes *
            </Label>
            <textarea
              id="completion-notes"
              rows={4}
              required
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Describe the action taken to resolve this civic complaint in detail..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />
          </div>

          <div>
            <Label className="required">Resolution Proof Image *</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-video mb-2">
                <img src={imagePreview} alt="Proof Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-emerald-50/30 hover:border-emerald-500/50 transition-all">
                <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs font-semibold text-zinc-700">Upload Resolution Proof Image</span>
                <span className="text-[10px] text-zinc-400">PNG, JPG or JPEG</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" size="sm" isLoading={isSubmitting}>
              Confirm Resolution
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
