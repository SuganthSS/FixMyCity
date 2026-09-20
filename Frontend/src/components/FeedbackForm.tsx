import React, { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Button, Card, Label } from './UI';
import { complaintApi } from '../services/complaintApi';

interface FeedbackFormProps {
  complaintId: string;
  existingFeedback?: { rating: number; comment?: string; submittedAt?: string };
  onFeedbackSubmitted?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId,
  existingFeedback,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(Boolean(existingFeedback));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await complaintApi.submitFeedback(complaintId, rating, comment);
      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted || existingFeedback) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-bold text-green-900">Feedback Submitted</h3>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= (existingFeedback?.rating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-zinc-300'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-green-800 ml-2">
            {existingFeedback?.rating || rating} / 5 Stars
          </span>
        </div>
        {(existingFeedback?.comment || comment) && (
          <p className="text-xs text-green-800 italic">"{existingFeedback?.comment || comment}"</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 border-amber-200 bg-amber-50/40">
      <div>
        <h3 className="text-base font-bold text-zinc-900">Citizen Resolution Feedback</h3>
        <p className="text-xs text-zinc-500">How satisfied are you with the resolution of this complaint?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1.5 block">Your Rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="feedback-comment" className="mb-1.5 block">Comments (Optional)</Label>
          <textarea
            id="feedback-comment"
            rows={3}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:ring-2 focus:ring-[#F27D26]"
            placeholder="Share details about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

        <Button type="submit" size="sm" isLoading={isSubmitting} className="w-full">
          Submit Feedback
          <Send className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </form>
    </Card>
  );
};
