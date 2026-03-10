import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, MapPin, ChevronLeft } from 'lucide-react';

const OFFICES = ['New York', 'Cedar Rapids', 'Miami'];

const ACTION_CARDS = [
  {
    to: '/MenuCalendar',
    icon: Calendar,
    title: 'Menu Calendar',
    description: "View the weekly breakfast menu and see what's being served each day.",
    color: 'bg-[#1E56C3]',
  },

  {
    to: '/FeedbackForm',
    icon: MessageSquare,
    title: 'Leave Feedback',
    description: 'Share your thoughts on the breakfast experience and help us improve.',
    color: 'bg-[#101585]',
  },
];

export default function Home() {
  const [selectedOffice, setSelectedOffice] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-5xl font-bold text-[#101585] mb-3">US WIX Breakfast Hub</h1>

      {!selectedOffice ? (
        <>
          <p className="text-gray-500 text-lg mb-12">Which office are you in?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
            {OFFICES.map((office) => (
              <button
                key={office}
                onClick={() => setSelectedOffice(office)}
                className="group flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="bg-[#1E56C3] text-white rounded-2xl p-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{office}</h2>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setSelectedOffice(null)}
              className="flex items-center gap-1 text-sm text-[#1E56C3] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" /> Change office
            </button>
          </div>
          <p className="text-gray-500 text-lg mb-12">
            <span className="font-semibold text-[#101585]">{selectedOffice}</span> — What would you like to do?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {ACTION_CARDS.filter(card => card.title !== 'Menu Calendar' || selectedOffice === 'Cedar Rapids').map(({ to, icon: Icon, title, description, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className={`${color} text-white rounded-2xl p-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}