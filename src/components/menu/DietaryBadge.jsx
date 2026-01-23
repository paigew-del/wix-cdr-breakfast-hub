import React from 'react';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const dietaryInfo = {
  GF: { label: 'GF', full: 'Gluten Free', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  GFA: { label: 'GFA', full: 'Gluten Free Available', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  VEG: { label: 'VEG', full: 'Vegetarian', color: 'bg-green-100 text-green-700 border-green-200' },
  VGN: { label: 'VGN', full: 'Vegan', color: 'bg-lime-100 text-lime-700 border-lime-200' },
  DFA: { label: 'DFA', full: 'Dairy Free Available', color: 'bg-sky-100 text-sky-700 border-sky-200' }
};

export default function DietaryBadge({ type }) {
  const info = dietaryInfo[type];
  if (!info) return null;

  return (
    <HoverCard>
      <HoverCardTrigger>
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
          info.color
        )}>
          {info.label}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2 text-xs">
        {info.full}
      </HoverCardContent>
    </HoverCard>
  );
}