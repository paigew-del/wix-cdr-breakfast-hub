import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuickFeedback({ menuDay }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const feedbacks = await base44.entities.Feedback.filter({ dateOfBreakfast: menuDay.date, created_by: user.email });
      if (feedbacks.length > 0) {
        setExisting(feedbacks[0]);
        setRating(feedbacks[0].varietyRating || 0);
        setSubmitted(true);
      } else {
        setExisting(null);
        setRating(0);
        setSubmitted(false);
      }
    };
    load();
  }, [menuDay.date]);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    if (existing) {
      await base44.entities.Feedback.update(existing.id, { varietyRating: rating });
    } else {
      await base44.entities.Feedback.create({ dateOfBreakfast: menuDay.date, varietyRating: rating });
    }
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        {submitted ? 'Your rating for this meal:' : 'Rate this meal:'}
      </p>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => { setRating(star); setSubmitted(false); }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hovered || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button
          size="sm"
          disabled={!rating || loading}
          onClick={handleSubmit}
          className="bg-[#1E56C3] hover:bg-[#101585] rounded-full text-white"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      ) : (
        <p className="text-sm text-green-600 font-medium">✓ Thanks for your feedback!</p>
      )}
    </div>
  );
}