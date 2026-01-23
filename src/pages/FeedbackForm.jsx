import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

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
                  ? "fill-amber-400 text-amber-400"
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
  const [formData, setFormData] = useState({
    employeeName: '',
    shiftStartTime: '',
    shiftType: '',
    dateOfBreakfast: format(new Date(), 'yyyy-MM-dd'),
    varietyRating: 0,
    varietyComments: '',
    allergiesHandledRating: 0,
    allergiesHandledComments: '',
    stockedAppropriately: '',
    stockingComments: '',
    menuSuggestions: '',
    otherFeedback: '',
    employeeDietaryNeeds: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.entities.Feedback.create(formData);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          employeeName: '',
          shiftStartTime: '',
          shiftType: '',
          dateOfBreakfast: format(new Date(), 'yyyy-MM-dd'),
          varietyRating: 0,
          varietyComments: '',
          allergiesHandledRating: 0,
          allergiesHandledComments: '',
          stockedAppropriately: '',
          stockingComments: '',
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Breakfast Feedback</h1>
                  <p className="text-slate-600">Help us improve your breakfast experience</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shift-time">Shift Start Time</Label>
                      <Input
                        id="shift-time"
                        type="time"
                        value={formData.shiftStartTime}
                        onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shift-type">Shift Type</Label>
                      <Select
                        value={formData.shiftType}
                        onValueChange={(value) => setFormData({ ...formData, shiftType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ratings */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Rate Your Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <StarRating
                      label="Variety of Food"
                      value={formData.varietyRating}
                      onChange={(value) => setFormData({ ...formData, varietyRating: value })}
                    />
                    <Textarea
                      className="mt-3"
                      placeholder="Comments about variety..."
                      value={formData.varietyComments}
                      onChange={(e) => setFormData({ ...formData, varietyComments: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <StarRating
                      label="Allergies Handled Appropriately"
                      value={formData.allergiesHandledRating}
                      onChange={(value) => setFormData({ ...formData, allergiesHandledRating: value })}
                    />
                    <Textarea
                      className="mt-3"
                      placeholder="Comments about allergy handling..."
                      value={formData.allergiesHandledComments}
                      onChange={(e) => setFormData({ ...formData, allergiesHandledComments: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      Was it stocked appropriately when you came into work?
                    </Label>
                    <div className="flex gap-3">
                      {['Yes', 'Somewhat', 'No'].map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={formData.stockedAppropriately === option ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, stockedAppropriately: option })}
                          className={cn(
                            "flex-1",
                            formData.stockedAppropriately === option && "bg-amber-600 hover:bg-amber-700"
                          )}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      className="mt-3"
                      placeholder="Comments about stocking..."
                      value={formData.stockingComments}
                      onChange={(e) => setFormData({ ...formData, stockingComments: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Your Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="menu-suggestions">Menu Suggestions</Label>
                    <Textarea
                      id="menu-suggestions"
                      placeholder="What would you like to see on the menu?"
                      value={formData.menuSuggestions}
                      onChange={(e) => setFormData({ ...formData, menuSuggestions: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="other-feedback">Any Other Feedback</Label>
                    <Textarea
                      id="other-feedback"
                      placeholder="Share any other thoughts..."
                      value={formData.otherFeedback}
                      onChange={(e) => setFormData({ ...formData, otherFeedback: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="mb-3 block">Your Dietary Needs (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {['GF', 'GFA', 'VEG', 'VGN', 'DFA', 'Other'].map((need) => (
                        <Button
                          key={need}
                          type="button"
                          variant={formData.employeeDietaryNeeds.includes(need) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDietaryNeedsChange(need)}
                          className={cn(
                            formData.employeeDietaryNeeds.includes(need) && "bg-teal-600 hover:bg-teal-700"
                          )}
                        >
                          {need}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12 text-base shadow-lg shadow-amber-500/20"
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