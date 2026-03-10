import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ManualMenuEntry({ onSaveComplete, onCancel, office }) {
  const [menuDay, setMenuDay] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    office: office,
    menuItems: [
      {
        itemName: '',
        description: '',
        isGF: false,
        isGFA: false,
        isVEG: false,
        isVGN: false,
        isDF: false,
        isDFA: false,
        isVGNA: false
      }
    ],
    specialNotes: ''
  });
  const [saving, setSaving] = useState(false);

  const addMenuItem = () => {
    setMenuDay({
      ...menuDay,
      menuItems: [
        ...menuDay.menuItems,
        {
          itemName: '',
          description: '',
          isGF: false,
          isGFA: false,
          isVEG: false,
          isVGN: false,
          isDF: false,
          isDFA: false,
          isVGNA: false
        }
      ]
    });
  };

  const removeMenuItem = (index) => {
    setMenuDay({
      ...menuDay,
      menuItems: menuDay.menuItems.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index, field, value) => {
    const newItems = [...menuDay.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuDay({ ...menuDay, menuItems: newItems });
  };

  const handleSave = async () => {
    if (!menuDay.date || menuDay.menuItems.length === 0 || !menuDay.menuItems[0].itemName) {
      alert('Please fill in at least the date and one menu item');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.MenuDay.create({ ...menuDay, office });
      onSaveComplete();
    } catch (error) {
      alert('Error saving menu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
          <span>Add Menu Day Manually</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date */}
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            required
            value={menuDay.date}
            onChange={(e) => setMenuDay({ ...menuDay, date: e.target.value })}
          />
        </div>

        {/* Menu Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Menu Items *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMenuItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {menuDay.menuItems.map((item, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-sm">Item Name *</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateMenuItem(index, 'itemName', e.target.value)}
                        placeholder="e.g. Scrambled Eggs"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Dietary Labels</Label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { key: 'isGF', label: 'Gluten Free' },
                          { key: 'isGFA', label: 'Gluten Free Available' },
                          { key: 'isVEG', label: 'Vegetarian' },
                          { key: 'isVGN', label: 'Vegan' },
                          { key: 'isDF', label: 'Dairy Free' },
                          { key: 'isDFA', label: 'Dairy Free Available' },
                          { key: 'isVGNA', label: 'Vegan Available' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${index}-${key}`}
                              checked={item[key]}
                              onCheckedChange={(checked) => updateMenuItem(index, key, checked)}
                            />
                            <Label
                              htmlFor={`${index}-${key}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {menuDay.menuItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMenuItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <Label htmlFor="special-notes">Special Notes</Label>
          <Textarea
            id="special-notes"
            value={menuDay.specialNotes}
            onChange={(e) => setMenuDay({ ...menuDay, specialNotes: e.target.value })}
            placeholder="Any special notes for this day..."
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-full"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Menu Day
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}