import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, StickyNote } from 'lucide-react';
import DietaryBadge from './DietaryBadge';
import { motion } from 'framer-motion';

export default function MenuCard({ menuDay, index }) {
  const date = new Date(menuDay.date);
  const dayOfWeek = format(date, 'EEEE');
  const formattedDate = format(date, 'MMM d, yyyy');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-100/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{dayOfWeek}</h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-0.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-6">
          <div className="space-y-4">
            {menuDay.menuItems?.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 leading-snug">
                      {item.itemName}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.isGF && <DietaryBadge type="GF" />}
                      {item.isGFA && <DietaryBadge type="GFA" />}
                      {item.isVEG && <DietaryBadge type="VEG" />}
                      {item.isVGN && <DietaryBadge type="VGN" />}
                      {item.isDFA && <DietaryBadge type="DFA" />}
                      {item.isVGNA && <DietaryBadge type="VGNA" />}
                    </div>
                  </div>
                </div>
                {idx < menuDay.menuItems.length - 1 && (
                  <div className="border-t border-slate-100 mt-4" />
                )}
              </div>
            ))}
          </div>
          {menuDay.specialNotes && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 italic">{menuDay.specialNotes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}