import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import MenuCard from '../components/menu/MenuCard';
import MenuFilters from '../components/menu/MenuFilters';
import UploadMenu from '../components/menu/UploadMenu';
import ManualMenuEntry from '../components/menu/ManualMenuEntry';
import { addDays, format, parseISO } from 'date-fns';

export default function MenuCalendar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Breakfast Menu Calendar
          </h1>
          <p className="text-slate-600 mt-1">2-Week Look Ahead</p>
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

      {/* Menu Grid */}
      {filteredMenuDays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuDays.map((menuDay, index) => (
            <MenuCard key={menuDay.id} menuDay={menuDay} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200/60">
          <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Menu Items</h3>
          <p className="text-slate-600">
            {selectedFilters.length > 0 
              ? 'No items match your dietary filters'
              : 'No menu has been uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
}