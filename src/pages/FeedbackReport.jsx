import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Star, MapPin, ChevronDown, ChevronUp, Package } from 'lucide-react';

const OFFICES = ['Cedar Rapids', 'New York', 'Miami'];

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ feedback }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{feedback.employeeName || 'Anonymous'}</span>
          <span className="text-xs text-gray-400">{feedback.dateOfBreakfast}</span>
          {feedback.shiftStartTime && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{feedback.shiftStartTime}</span>
          )}
          {feedback.varietyRating && <StarDisplay value={feedback.varietyRating} />}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Variety */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Variety Rating</p>
              {feedback.varietyRating ? <StarDisplay value={feedback.varietyRating} /> : <span className="text-xs text-gray-400">Not rated</span>}
              {feedback.varietyComments && <p className="text-sm text-gray-700 mt-1">"{feedback.varietyComments}"</p>}
            </div>

            {/* Allergy Handling */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Allergy Handling</p>
              {feedback.allergiesHandledRating ? <StarDisplay value={feedback.allergiesHandledRating} /> : <span className="text-xs text-gray-400">Not rated</span>}
              {feedback.allergiesHandledComments && <p className="text-sm text-gray-700 mt-1">"{feedback.allergiesHandledComments}"</p>}
            </div>

            {/* Stocking */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Stocked Appropriately</p>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                feedback.stockedAppropriately === 'Yes' ? 'bg-green-100 text-green-700' :
                feedback.stockedAppropriately === 'No' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {feedback.stockedAppropriately || 'N/A'}
              </span>
              {feedback.stockingComments && <p className="text-sm text-gray-700 mt-1">"{feedback.stockingComments}"</p>}
            </div>

            {/* Dietary needs */}
            {feedback.employeeDietaryNeeds?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Dietary Needs</p>
                <div className="flex flex-wrap gap-1">
                  {feedback.employeeDietaryNeeds.map(d => (
                    <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu item ratings */}
          {feedback.menuItemRatings?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Menu Item Ratings</p>
              <div className="space-y-2">
                {feedback.menuItemRatings.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-800 min-w-0 flex-1">{item.itemName}</span>
                    {item.rating && <StarDisplay value={item.rating} />}
                    {item.comment && <span className="text-xs text-gray-500 italic">"{item.comment}"</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions & other */}
          {feedback.menuSuggestions && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Menu Suggestions</p>
              <p className="text-sm text-gray-700 bg-amber-50 rounded-lg px-3 py-2">💡 {feedback.menuSuggestions}</p>
            </div>
          )}
          {feedback.otherFeedback && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Other Feedback</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{feedback.otherFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfficeGroup({ office, feedbackList }) {
  const avgVariety = useMemo(() => {
    const rated = feedbackList.filter(f => f.varietyRating);
    return rated.length ? (rated.reduce((s, f) => s + f.varietyRating, 0) / rated.length).toFixed(1) : null;
  }, [feedbackList]);

  const avgAllergy = useMemo(() => {
    const rated = feedbackList.filter(f => f.allergiesHandledRating);
    return rated.length ? (rated.reduce((s, f) => s + f.allergiesHandledRating, 0) / rated.length).toFixed(1) : null;
  }, [feedbackList]);

  const stockCounts = useMemo(() => {
    return feedbackList.reduce((acc, f) => {
      if (f.stockedAppropriately) acc[f.stockedAppropriately] = (acc[f.stockedAppropriately] || 0) + 1;
      return acc;
    }, {});
  }, [feedbackList]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">{office}</h2>
        </div>
        <span className="text-sm text-gray-400">{feedbackList.length} response{feedbackList.length !== 1 ? 's' : ''}</span>
        {avgVariety && (
          <span className="flex items-center gap-1 text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {avgVariety} variety avg
          </span>
        )}
        {avgAllergy && (
          <span className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 fill-green-400 text-green-400" /> {avgAllergy} allergy avg
          </span>
        )}
        {Object.entries(stockCounts).map(([k, v]) => (
          <span key={k} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            k === 'Yes' ? 'bg-green-100 text-green-700' : k === 'No' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            <Package className="h-3 w-3 inline mr-1" />{k}: {v}
          </span>
        ))}
      </div>

      {feedbackList.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No feedback for this location yet.</p>
      ) : (
        <div className="space-y-2">
          {feedbackList.map((f, i) => <FeedbackCard key={i} feedback={f} />)}
        </div>
      )}
    </div>
  );
}

export default function FeedbackReport() {
  const [dateFilter, setDateFilter] = useState('all');

  const { data: allFeedback = [], isLoading } = useQuery({
    queryKey: ['feedback-report'],
    queryFn: () => base44.entities.Feedback.list('-dateOfBreakfast', 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['feedback-report-users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Enrich feedback with office info from users
  const enriched = useMemo(() => {
    return allFeedback.map(f => {
      const user = users.find(u => u.email === f.created_by);
      return { ...f, office: user?.office || null };
    });
  }, [allFeedback, users]);

  // Date filter options
  const dateOptions = useMemo(() => {
    const dates = [...new Set(allFeedback.map(f => f.dateOfBreakfast).filter(Boolean))].sort().reverse();
    return dates;
  }, [allFeedback]);

  const filtered = useMemo(() => {
    if (dateFilter === 'all') return enriched;
    return enriched.filter(f => f.dateOfBreakfast === dateFilter);
  }, [enriched, dateFilter]);

  const byOffice = useMemo(() => {
    return OFFICES.map(office => ({
      office,
      items: filtered.filter(f => f.office === office),
    }));
  }, [filtered]);

  const unassigned = useMemo(() => filtered.filter(f => !f.office), [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101585]">Feedback Report</h1>
          <p className="text-gray-500 mt-1">Employee breakfast feedback grouped by office location</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter by date:</span>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              {dateOptions.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No feedback submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {byOffice.map(({ office, items }) => (
            <Card key={office} className="rounded-2xl border-gray-200 shadow-sm bg-white">
              <CardContent className="pt-6 pb-6">
                <OfficeGroup office={office} feedbackList={items} />
              </CardContent>
            </Card>
          ))}
          {unassigned.length > 0 && (
            <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
              <CardContent className="pt-6 pb-6">
                <OfficeGroup office="Unassigned" feedbackList={unassigned} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}