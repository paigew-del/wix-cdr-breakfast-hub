import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Calendar, MessageSquare, BarChart3, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'MenuCalendar', label: 'Menu Calendar', icon: Calendar },
    { name: 'FeedbackForm', label: 'Feedback', icon: MessageSquare },
    { name: 'Analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: 0 102 255;
          --primary-foreground: 255 255 255;
          --accent: 0 102 255;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/Home" className="flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tight text-[#101585]">
                WIX
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-base font-medium text-gray-900">CDR Breakfast</h1>
              </div>
            </Link>
            
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}