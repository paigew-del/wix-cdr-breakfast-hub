import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertCircle, Coffee, Send, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const REFRESHMENT_SECTIONS = {
  'Energy Drinks': [
    'Alani Nu',
    'Monster',
    'Red Bull'
  ],
  'Drinks': [
    'Sparkling water',
    'V8 juice',
    'Body armours',
    'Teas',
    'Milk',
    'Orange juice',
    'Coffee creamers'
  ],
  'Protein & Dairy': [
    'Chicken salad',
    'Cottage cheese',
    'Boiled eggs',
    'String cheese',
    'Cheese bites',
    'Yogurt',
    'Balance breaks'
  ],
  'Snacks': [
    'Applesauce',
    'Uncrustables',
    'Fresh fruit',
    'Croissants',
    'Fresh veggies',
    'Dried fruit',
    'Bread',
    'Chips',
    'Protein bars',
    'Granola bars',
    'Gum',
    'Beef jerky'
  ]
};

export default function Refreshments() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [flavorInputs, setFlavorInputs] = useState({ 'Alani Nu': '', 'Monster': '', 'Red Bull': '' });
  const [showFlavorInput, setShowFlavorInput] = useState({ 'Alani Nu': false, 'Monster': false, 'Red Bull': false });
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: adminUsers = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.role === 'admin');
    },
    initialData: []
  });

  const FLAVOR_ITEMS = ['Alani Nu', 'Monster', 'Red Bull'];

  const toggleItem = (itemName) => {
    if (FLAVOR_ITEMS.includes(itemName)) {
      if (selectedItems.some(i => i.startsWith(itemName))) {
        setSelectedItems(prev => prev.filter(i => !i.startsWith(itemName)));
        setShowFlavorInput(prev => ({ ...prev, [itemName]: false }));
        setFlavorInputs(prev => ({ ...prev, [itemName]: '' }));
      } else {
        setShowFlavorInput(prev => ({ ...prev, [itemName]: true }));
      }
      return;
    }
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleFlavorConfirm = (itemName) => {
    const flavor = flavorInputs[itemName].trim();
    const label = flavor ? `${itemName} (${flavor})` : itemName;
    setSelectedItems(prev => [...prev, label]);
    setShowFlavorInput(prev => ({ ...prev, [itemName]: false }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setSubmitting(true);
    try {
      // Create reports for each item
      await Promise.all(
        selectedItems.map(itemName =>
          base44.entities.RefreshmentReport.create({
            itemName,
            status: 'out_of_stock',
            reportedBy: user?.email || 'anonymous'
          })
        )
      );

      // Send email to all admin users
      const itemsList = selectedItems.join(', ');
      await Promise.all(
        adminUsers.map(admin =>
          base44.integrations.Core.SendEmail({
            to: admin.email,
            subject: 'Out of Stock Alert - CDR Breakfast',
            body: `The following items have been reported as out of stock:\n\n${selectedItems.map(item => `• ${item}`).join('\n')}\n\nReported by: ${user?.email || 'Anonymous'}`
          })
        )
      );

      toast.success('Report submitted successfully');
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['refreshmentReports'] });
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) {
      toast.error('Please enter a suggestion');
      return;
    }

    setSubmittingSuggestion(true);
    try {
      await Promise.all(
        adminUsers.map(admin =>
          base44.integrations.Core.SendEmail({
            to: admin.email,
            subject: 'New Refreshment Suggestion - CDR Breakfast',
            body: `A new refreshment suggestion has been submitted:\n\n${suggestion}\n\nSuggested by: ${user?.email || 'Anonymous'}`
          })
        )
      );

      toast.success('Suggestion submitted successfully');
      setSuggestion('');
    } catch (error) {
      toast.error('Failed to submit suggestion');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Coffee className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refreshments</h1>
            <p className="text-gray-600 mt-1">Select items that are out of stock</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">Suggest a Refreshment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Have a snack or beverage you'd like to see in the office? Let the operations team know!
            </p>
            <Textarea
              placeholder="E.g., Kombucha, trail mix, rice cakes..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="mb-4 min-h-[100px]"
            />
            <Button
              onClick={handleSuggestionSubmit}
              disabled={submittingSuggestion || !suggestion.trim()}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              {submittingSuggestion ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {Object.entries(REFRESHMENT_SECTIONS).map(([section, items]) => (
          <Card key={section} className="border-gray-200 shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">{section}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => {
                  const isSelected = FLAVOR_ITEMS.includes(item)
                    ? selectedItems.some(i => i.startsWith(item))
                    : selectedItems.includes(item);
                  
                  return (
                    <div key={item} className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleItem(item)}
                        className={`p-3 rounded-xl border-2 transition-all text-left w-full ${
                          isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-medium ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                            {FLAVOR_ITEMS.includes(item) && isSelected
                              ? selectedItems.find(i => i.startsWith(item)) || item
                              : item}
                          </span>
                          {isSelected && (
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {FLAVOR_ITEMS.includes(item) && showFlavorInput[item] && (
                        <div className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-xs text-blue-700 font-medium">Which flavor needs restocking?</p>
                          <Input
                            placeholder="e.g. Watermelon, Original..."
                            value={flavorInputs[item]}
                            onChange={(e) => setFlavorInputs(prev => ({ ...prev, [item]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleFlavorConfirm(item)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleFlavorConfirm(item)} className="bg-blue-600 hover:bg-blue-700 rounded-full text-xs flex-1">
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowFlavorInput(prev => ({ ...prev, [item]: false }))} className="rounded-full text-xs flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedItems.length > 0 && (
          <Card className="border-blue-200 shadow-sm rounded-2xl bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</p>
                  <p className="text-sm text-gray-600 mt-1">Click submit to notify admins</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full"
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}