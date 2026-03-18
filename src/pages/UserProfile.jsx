import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, User, MapPin, AlertTriangle, UtensilsCrossed, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import FeedbackHistory from '../components/feedback/FeedbackHistory';
import DraggablePhoto from '../components/profile/DraggablePhoto';

const DIETARY_OPTIONS = [
  { key: 'None', label: 'None' },
  { key: 'GF', label: 'Gluten Free' },
  { key: 'GFA', label: 'Gluten Free Available' },
  { key: 'VEG', label: 'Vegetarian' },
  { key: 'VGN', label: 'Vegan' },
  { key: 'VGNA', label: 'Vegan Available' },
  { key: 'DF', label: 'Dairy Free' },
  { key: 'DFA', label: 'Dairy Free Available' },
];

const SHIFT_TIMES = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'];

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    office: '',
    shift_start_time: '',
    dietary_restrictions: [],
    allergies: '',
    other_notes: '',
    photo_url: '',
    photo_position: { x: 0, y: 0 },
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setProfile({
        office: u.office || '',
        shift_start_time: u.shift_start_time || '',
        dietary_restrictions: u.dietary_restrictions || [],
        allergies: u.allergies || '',
        other_notes: u.other_notes || '',
        photo_url: u.photo_url || '',
        photo_position: u.photo_position || { x: 0, y: 0 },
      });
    });
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile((p) => ({ ...p, photo_url: file_url, photo_position: { x: 0, y: 0 } }));
    setUploading(false);
  };

  const toggleDietary = (key) => {
    setProfile((p) => ({
      ...p,
      dietary_restrictions: p.dietary_restrictions.includes(key)
        ? p.dietary_restrictions.filter((d) => d !== key)
        : [...p.dietary_restrictions, key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(profile);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#101585]">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your breakfast preferences and details</p>
      </div>

      {/* Photo & Basic Info */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <User className="h-5 w-5 text-blue-600" /> Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <DraggablePhoto
              photoUrl={profile.photo_url}
              position={profile.photo_position}
              onPositionChange={(pos) => setProfile((p) => ({ ...p, photo_position: pos }))}
              initials={initials}
            />
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {uploading && <p className="text-xs text-blue-600">Uploading photo...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Office & Shift */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <MapPin className="h-5 w-5 text-blue-600" /> Office & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Office Location</Label>
            <Select value={profile.office} onValueChange={(v) => setProfile((p) => ({ ...p, office: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Cedar Rapids">Cedar Rapids</SelectItem>
                <SelectItem value="Miami">Miami</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Shift Start Time</Label>
            <Select value={profile.shift_start_time} onValueChange={(v) => setProfile((p) => ({ ...p, shift_start_time: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your shift start time" />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_TIMES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <UtensilsCrossed className="h-5 w-5 text-blue-600" /> Dietary Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDietary(key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  profile.dietary_restrictions.includes(key)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                )}
              >
                {key} — {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <AlertTriangle className="h-5 w-5 text-orange-500" /> Food Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">Please list specific food allergies that cause a reaction — not food preferences or dislikes.</p>
          <Textarea
            placeholder="List any food allergies (e.g. peanuts, tree nuts, shellfish, eggs...)"
            value={profile.allergies}
            onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Other Notes */}
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Clock className="h-5 w-5 text-blue-600" /> Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any other preferences, notes, or information Wix should know for your breakfast experience..."
            value={profile.other_notes}
            onChange={(e) => setProfile((p) => ({ ...p, other_notes: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      <FeedbackHistory userEmail={user.email} />

      <Button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          'w-full rounded-full text-base py-6 transition-all',
          saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        )}
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : (
          <><Save className="h-4 w-4 mr-2" /> Save Profile</>
        )}
      </Button>
    </div>
  );
}