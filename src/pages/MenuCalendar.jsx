import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, X } from 'lucide-react';
import MenuCard from '../components/menu/MenuCard';
import MenuFilters from '../components/menu/MenuFilters';
import UploadMenu from '../components/menu/UploadMenu';
import ManualMenuEntry from '../components/menu/ManualMenuEntry';
import DietaryBadge from '../components/menu/DietaryBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addDays, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function MenuCalendar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

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
            <h1 className="text-4xl font-bold text-blue-600">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Breakfast Menu Calendar</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              className="rounded-full hover:bg-blue-50"
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="rounded-full hover:bg-purple-50"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className="rounded-full hover:bg-pink-50"
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
              className={!showUpload ? "bg-blue-600 hover:bg-blue-700 rounded-full" : "rounded-full"}
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
              className={!showManualEntry ? "bg-blue-600 hover:bg-blue-700 rounded-full" : "rounded-full"}
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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            return (
              <div key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-700">
                {day}
              </div>
            );
          })}
        
          {/* Calendar Days */}
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const menuDay = menuByDate[dateStr];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-3 rounded-xl transition-all ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isTodayDate ? 'ring-2 ring-blue-600' : ''} ${
                  menuDay ? 'cursor-pointer hover:bg-blue-50' : ''
                }`}
                onClick={() => menuDay && setSelectedDay(menuDay)}
              >
                <div className={`text-sm font-semibold mb-2 ${
                  !isCurrentMonth ? 'text-gray-400' : isTodayDate ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {menuDay && menuDay.menuItems && (
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-600 text-white inline-block">
                    {menuDay.menuItems.length} item{menuDay.menuItems.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Detail Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedDay && format(parseISO(selectedDay.date), 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDay?.menuItems?.map((item, idx) => {
              return (
                <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.itemName}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {item.isGF && <DietaryBadge type="GF" />}
                    {item.isGFA && <DietaryBadge type="GFA" />}
                    {item.isVEG && <DietaryBadge type="VEG" />}
                    {item.isVGN && <DietaryBadge type="VGN" />}
                    {item.isDF && <DietaryBadge type="DF" />}
                    {item.isDFA && <DietaryBadge type="DFA" />}
                    {item.isVGNA && <DietaryBadge type="VGNA" />}
                  </div>
                </div>
              );
            })}
            {selectedDay?.specialNotes && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-700"><strong>Note:</strong> {selectedDay.specialNotes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}