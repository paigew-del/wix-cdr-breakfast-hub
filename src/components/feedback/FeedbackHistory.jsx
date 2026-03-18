import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const StarDisplay = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        className={cn('h-4 w-4', value >= s ? 'fill-blue-500 text-blue-500' : 'text-slate-200')}
      />
    ))}
  </div>
);

function FeedbackCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 text-sm">
            {entry.dateOfBreakfast
              ? format(new Date(entry.dateOfBreakfast + 'T12:00:00'), 'MMMM d, yyyy')
              : 'Unknown date'}
          </span>
          {entry.varietyRating > 0 && (
            <StarDisplay value={entry.varietyRating} />
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 py-4 space-y-4 text-sm text-gray-700">
          {entry.varietyRating > 0 && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Variety Rating</p>
              <StarDisplay value={entry.varietyRating} />
              {entry.varietyComments && <p className="mt-1 text-gray-600">{entry.varietyComments}</p>}
            </div>
          )}
          {entry.allergiesHandledRating > 0 && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Allergies Handled</p>
              <StarDisplay value={entry.allergiesHandledRating} />
              {entry.allergiesHandledComments && <p className="mt-1 text-gray-600">{entry.allergiesHandledComments}</p>}
            </div>
          )}
          {entry.stockedAppropriately && (
            <div>
              <p className="font-medium text-gray-500">Stocked Appropriately</p>
              <span className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                entry.stockedAppropriately === 'Yes' ? 'bg-green-100 text-green-700' :
                entry.stockedAppropriately === 'Somewhat' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>{entry.stockedAppropriately}</span>
              {entry.stockingComments && <p className="mt-1 text-gray-600">{entry.stockingComments}</p>}
            </div>
          )}
          {entry.menuItemRatings?.length > 0 && (
            <div>
              <p className="font-medium text-gray-500 mb-2">Menu Item Ratings</p>
              <div className="space-y-2">
                {entry.menuItemRatings.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                      {item.comment && <p className="text-xs text-gray-500 mt-0.5">{item.comment}</p>}
                    </div>
                    {item.rating > 0 && <StarDisplay value={item.rating} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {entry.menuSuggestions && (
            <div>
              <p className="font-medium text-gray-500">Menu Suggestions</p>
              <p className="mt-1">{entry.menuSuggestions}</p>
            </div>
          )}
          {entry.otherFeedback && (
            <div>
              <p className="font-medium text-gray-500">Other Feedback</p>
              <p className="mt-1">{entry.otherFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackHistory({ userEmail }) {
  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ['my-feedback', userEmail],
    queryFn: () => base44.entities.Feedback.filter({ created_by: userEmail }, '-created_date'),
    enabled: !!userEmail,
  });

  return (
    <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <MessageSquare className="h-5 w-5 text-blue-600" /> My Feedback History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : feedbackList.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {feedbackList.map((entry) => (
              <FeedbackCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}