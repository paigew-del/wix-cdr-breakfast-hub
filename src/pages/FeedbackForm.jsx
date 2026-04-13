import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Send, CheckCircle2, MessageSquare, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import DietaryBadge from '../components/menu/DietaryBadge';

const StarRating = ({ value, onChange, label }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                (hover || value) >= star
                  ? "fill-blue-500 text-blue-500"
                  : "text-slate-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function FeedbackForm() {
  const urlOffice = new URLSearchParams(window.location.search).get('office');
  const [office, setOffice] = useState(urlOffice);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role !== 'admin' && u?.office) {
        setOffice(u.office);
      }
      setFormData(prev => ({
        ...prev,
        employeeName: u?.full_name || '',
        employeeEmail: u?.email || '',
        shiftStartTime: u?.shift_start_time || '',
      }));
    });
  }, []);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    shiftStartTime: '',
    dateOfBreakfast: format(new Date(), 'yyyy-MM-dd'),
    varietyRating: 0,
    varietyComments: '',
    varietyOverTimeRating: 0,
    qualityTasteRating: 0,
    allergiesHandledRating: 0,
    allergiesHandledComments: '',
    stockedAppropriately: '',
    stockingComments: '',
    menuItemRatings: [],
    menuSuggestions: '',
    otherFeedback: '',
    employeeDietaryNeeds: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch menu for the selected date
  const { data: menuDay } = useQuery({
    queryKey: ['menuDay', formData.dateOfBreakfast],
    queryFn: async () => {
      const filter = { date: formData.dateOfBreakfast };
      if (office) filter.office = office;
      const menus = await base44.entities.MenuDay.filter(filter);
      return menus[0] || null;
    },
    enabled: !!formData.dateOfBreakfast
  });

  // Initialize menu item ratings when menu loads
  useEffect(() => {
    if (menuDay?.menuItems) {
      const existingItemNames = formData.menuItemRatings.map(r => r.itemName);
      const newItems = menuDay.menuItems
        .filter(item => !existingItemNames.includes(item.itemName))
        .map(item => ({
          itemName: item.itemName,
          rating: 0,
          comment: ''
        }));
      
      if (newItems.length > 0) {
        setFormData(prev => ({
          ...prev,
          menuItemRatings: [...prev.menuItemRatings, ...newItems]
        }));
      }
    }
  }, [menuDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.entities.Feedback.create(formData);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          employeeName: '',
          employeeEmail: '',
          shiftStartTime: '',
          dateOfBreakfast: format(new Date(), 'yyyy-MM-dd'),
          varietyRating: 0,
          varietyComments: '',
          varietyOverTimeRating: 0,
          qualityTasteRating: 0,
          allergiesHandledRating: 0,
          allergiesHandledComments: '',
          stockedAppropriately: '',
          stockingComments: '',
          menuItemRatings: [],
          menuSuggestions: '',
          otherFeedback: '',
          employeeDietaryNeeds: []
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDietaryNeedsChange = (value) => {
    if (formData.employeeDietaryNeeds.includes(value)) {
      setFormData({
        ...formData,
        employeeDietaryNeeds: formData.employeeDietaryNeeds.filter(v => v !== value)
      });
    } else {
      setFormData({
        ...formData,
        employeeDietaryNeeds: [...formData.employeeDietaryNeeds, value]
      });
    }
  };

  const updateMenuItemRating = (itemName, field, value) => {
    setFormData(prev => ({
      ...prev,
      menuItemRatings: prev.menuItemRatings.map(item =>
        item.itemName === itemName ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600">Your feedback has been submitted successfully.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Breakfast Feedback</h1>
                  <p className="text-gray-600 mt-1">Help us improve your breakfast experience</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Your Information</CardTitle>
                  <CardDescription>Optional but helps us understand patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.employeeName}
                        onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Your Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.employeeEmail}
                        onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                        placeholder="you@wix.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date of Breakfast *</Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        value={formData.dateOfBreakfast}
                        onChange={(e) => setFormData({ ...formData, dateOfBreakfast: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shift-time">Shift Start Time</Label>
                    <Input
                      id="shift-time"
                      type="time"
                      value={formData.shiftStartTime}
                      onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Overall Experience */}
              <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Breakfast Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <StarRating
                      label="How satisfied are you with our breakfasts? (1 = not very satisfied, 5 = very satisfied)"
                      value={formData.varietyRating}
                      onChange={(value) => setFormData({ ...formData, varietyRating: value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <StarRating
                      label="How satisfied are you with the variety of breakfast options over time?"
                      value={formData.varietyOverTimeRating}
                      onChange={(value) => setFormData({ ...formData, varietyOverTimeRating: value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <StarRating
                      label="How satisfied are you with the quality and taste of the breakfast items?"
                      value={formData.qualityTasteRating}
                      onChange={(value) => setFormData({ ...formData, qualityTasteRating: value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label htmlFor="favorite-items" className="text-sm font-medium text-slate-700">What have been your favorite items offered?</Label>
                    <Textarea
                      id="favorite-items"
                      className="mt-2"
                      placeholder="e.g. bagels, fruit cups, yogurt..."
                      value={formData.varietyComments}
                      onChange={(e) => setFormData({ ...formData, varietyComments: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label htmlFor="least-favorite-items" className="text-sm font-medium text-slate-700">What have been your least favorite items offered?</Label>
                    <Textarea
                      id="least-favorite-items"
                      className="mt-2"
                      placeholder="e.g. ..."
                      value={formData.allergiesHandledComments}
                      onChange={(e) => setFormData({ ...formData, allergiesHandledComments: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label htmlFor="menu-suggestions" className="text-sm font-medium text-slate-700">What would you like to see added to our breakfast menu?</Label>
                    <Textarea
                      id="menu-suggestions"
                      className="mt-2"
                      placeholder="e.g. hot items, more variety, specific foods..."
                      value={formData.menuSuggestions}
                      onChange={(e) => setFormData({ ...formData, menuSuggestions: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label htmlFor="other-feedback" className="text-sm font-medium text-slate-700">Any additional comments regarding our breakfast offerings?</Label>
                    <Textarea
                      id="other-feedback"
                      className="mt-2"
                      placeholder="Share any other thoughts..."
                      value={formData.otherFeedback}
                      onChange={(e) => setFormData({ ...formData, otherFeedback: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Items Ratings */}
              {menuDay && menuDay.menuItems && menuDay.menuItems.length > 0 && (
                <Card className="border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                      Rate Today's Menu
                    </CardTitle>
                    <CardDescription>How did you like each item?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {menuDay.menuItems.map((menuItem, idx) => {
                      const itemRating = formData.menuItemRatings.find(r => r.itemName === menuItem.itemName);
                      return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-medium text-slate-900">{menuItem.itemName}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {menuItem.isGF && <DietaryBadge type="GF" />}
                                {menuItem.isGFA && <DietaryBadge type="GFA" />}
                                {menuItem.isVEG && <DietaryBadge type="VEG" />}
                                {menuItem.isVGN && <DietaryBadge type="VGN" />}
                                {menuItem.isDF && <DietaryBadge type="DF" />}
                                {menuItem.isDFA && <DietaryBadge type="DFA" />}
                                {menuItem.isVGNA && <DietaryBadge type="VGNA" />}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateMenuItemRating(menuItem.itemName, 'rating', star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={cn(
                                    "h-6 w-6 transition-colors",
                                    itemRating && itemRating.rating >= star
                                      ? "fill-blue-500 text-blue-500"
                                      : "text-slate-300"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Comments about this item..."
                            value={itemRating?.comment || ''}
                            onChange={(e) => updateMenuItemRating(menuItem.itemName, 'comment', e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold rounded-full"
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}