import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const dietaryOptions = [
  { value: 'GF', label: 'Gluten Free', color: 'emerald' },
  { value: 'GFA', label: 'GF Available', color: 'teal' },
  { value: 'VEG', label: 'Vegetarian', color: 'green' },
  { value: 'VGN', label: 'Vegan', color: 'lime' },
  { value: 'DF', label: 'Dairy Free', color: 'blue' },
  { value: 'DFA', label: 'Dairy Free Available', color: 'sky' },
  { value: 'VGNA', label: 'Vegan Available', color: 'purple' }
];

export default function MenuFilters({ selectedFilters, onFilterChange }) {
  const toggleFilter = (value) => {
    if (selectedFilters.includes(value)) {
      onFilterChange(selectedFilters.filter(f => f !== value));
    } else {
      onFilterChange([...selectedFilters, value]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600" />
          <h3 className="font-medium text-slate-900">Filter by Dietary Needs</h3>
        </div>
        {selectedFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {dietaryOptions.map((option) => {
          const isSelected = selectedFilters.includes(option.value);
          return (
            <Button
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(option.value)}
              className={cn(
                "transition-all",
                isSelected && `bg-${option.color}-600 hover:bg-${option.color}-700 text-white border-${option.color}-600`
              )}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}