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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/60 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/Home" className="flex items-center gap-3">
              {/* Wix-style logo */}
              <svg width="46" height="18" viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="16" fontFamily="'Wix Madefor Text', sans-serif" fontWeight="800" fontSize="18" fill="#116DFF" letterSpacing="-1">WiX</text>
              </svg>
              <div className="h-5 w-px bg-gray-200"></div>
              <span className="text-sm font-semibold text-foreground tracking-tight">US Breakfast Hub</span>
            </Link>
            
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link to="/AdminDashboard" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link to="/UserProfile" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted">
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">My Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}