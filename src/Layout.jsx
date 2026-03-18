import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, LayoutDashboard } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin'));
  }, []);

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
                <h1 className="text-base font-medium text-gray-900">US WIX Breakfast Hub</h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/AdminDashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1E56C3] transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link to="/UserProfile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1E56C3] transition-colors">
                <UserCircle className="h-6 w-6" />
                <span className="hidden sm:inline">My Profile</span>
              </Link>
            </div>
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