import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import MenuCard from '../components/menu/MenuCard';
import MenuFilters from '../components/menu/MenuFilters';
import UploadMenu from '../components/menu/UploadMenu';
import ManualMenuEntry from '../components/menu/ManualMenuEntry';
import { addDays, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function MenuCalendar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await base44.auth.me();
      setIsAdmin(user.role === 'admin');
    };
    checkAdmin();
  }, []);

  const { data: menuDays = [], isLoading, refetch } = useQuery({
    queryKey: ['menuDays'],
    queryFn: async () => {
      const days = await base44.entities.MenuDay.list('-date');
      return days.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  });

  const filteredMenuDays = menuDays.filter(day => {
    if (selectedFilters.length === 0) return true;

    return day.menuItems?.some(item => 
      selectedFilters.every(filter => {
        if (filter === 'GF') return item.isGF;
        if (filter === 'GFA') return item.isGFA;
        if (filter === 'VEG') return item.isVEG;
        if (filter === 'VGN') return item.isVGN;
        if (filter === 'DFA') return item.isDFA;
        if (filter === 'VGNA') return item.isVGNA;
        return false;
      })
    );
  });

  // Calendar grid generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Create a map of dates to menu data
  const menuByDate = {};
  filteredMenuDays.forEach(day => {
    menuByDate[day.date] = day;
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleUploadComplete = () => {
    refetch();
    setShowUpload(false);
  };

  const handleManualSaveComplete = () => {
    refetch();
    setShowManualEntry(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-slate-600 mt-1">Breakfast Menu Calendar</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            >
              Next →
            </Button>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowUpload(!showUpload);
                setShowManualEntry(false);
              }}
              variant={showUpload ? "outline" : "default"}
              className={!showUpload ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <Button
              onClick={() => {
                setShowManualEntry(!showManualEntry);
                setShowUpload(false);
              }}
              variant={showManualEntry ? "outline" : "default"}
              className={!showManualEntry ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>
        )}
      </div>

      {/* Upload Section (Admin Only) */}
      {isAdmin && showUpload && (
        <UploadMenu onUploadComplete={handleUploadComplete} />
      )}

      {/* Manual Entry Section (Admin Only) */}
      {isAdmin && showManualEntry && (
        <ManualMenuEntry 
          onSaveComplete={handleManualSaveComplete}
          onCancel={() => setShowManualEntry(false)}
        />
      )}

      {/* Filters */}
      <MenuFilters 
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
      />

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-slate-700 text-sm bg-slate-50">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const menuDay = menuByDate[dateStr];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${
                  !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
                } ${isTodayDate ? 'ring-2 ring-amber-400 ring-inset' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !isCurrentMonth ? 'text-slate-400' : isTodayDate ? 'text-amber-600' : 'text-slate-700'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {menuDay && menuDay.menuItems && (
                  <div className="space-y-1">
                    {menuDay.menuItems.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="text-xs p-1.5 bg-amber-50 border border-amber-200 rounded text-slate-700 truncate hover:bg-amber-100 transition-colors"
                        title={item.itemName}
                      >
                        {item.itemName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}