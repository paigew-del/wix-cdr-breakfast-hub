import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, MapPin, ChevronLeft, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTION_CARDS = [
  {
    to: '/MenuCalendar',
    icon: Calendar,
    title: 'Menu Calendar',
    description: "View the weekly breakfast menu and see what's being served each day.",
    accent: 'bg-primary',
    bg: 'bg-secondary',
  },
  {
    to: '/FeedbackForm',
    icon: MessageSquare,
    title: 'Leave Feedback',
    description: 'Share your thoughts on the breakfast experience and help us improve.',
    accent: 'bg-accent',
    bg: 'bg-orange-50',
  },
];

export default function Home() {
  const [selectedOffice, setSelectedOffice] = useState(null);

  const { data: officeRecords = [] } = useQuery({
    queryKey: ['office-locations'],
    queryFn: () => base44.entities.OfficeLocation.list(),
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.office) setSelectedOffice(u.office);
    });
  }, []);

  const OFFICES = officeRecords
    .filter(o => o.visible !== false)
    .map(o => o.name);

  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] px-4 py-12">
      {/* Hero image header */}
      <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-xl mb-10 relative">
        <img
          src="https://media.base44.com/images/public/6973e5263b7dbcde19e59f1c/a499f31f0_image.png"
          alt="Breakfast spread"
          className="w-full h-56 sm:h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3 tracking-wide uppercase self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
            Wix US Offices
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            US Breakfast Hub
          </h1>
          <p className="text-white/80 text-base mt-2">
            {!selectedOffice ? 'Select your office to get started.' : `${selectedOffice} — What would you like to do?`}
          </p>
          {selectedOffice && (
            <button
              onClick={() => setSelectedOffice(null)}
              className="mt-2 inline-flex items-center gap-1 text-sm text-white/90 hover:text-white font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Change office
            </button>
          )}
        </div>
      </div>

      {!selectedOffice ? (
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
          {OFFICES.map((office) => (
            <button
              key={office}
              onClick={() => setSelectedOffice(office)}
              className="group flex flex-col items-center gap-4 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-200 text-center w-48"
            >
              <div className="bg-secondary text-primary rounded-xl p-3.5 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{office}</h2>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
          {ACTION_CARDS.map(({ to, icon: Icon, title, description, accent, bg }) => (
            <Link
              key={to}
              to={`${to}?office=${encodeURIComponent(selectedOffice)}`}
              className="group flex flex-col gap-5 p-7 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-200"
            >
              <div className={`${bg} rounded-xl p-3.5 self-start group-hover:scale-105 transition-transform`}>
                <Icon className={`h-6 w-6 ${accent === 'bg-primary' ? 'text-primary' : 'text-accent'}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground mb-1">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                Go <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}