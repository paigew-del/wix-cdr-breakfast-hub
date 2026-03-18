import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, CheckCircle2, MapPin, AlertTriangle, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIETARY_OPTIONS = [
  { key: 'GF', label: 'Gluten Free' },
  { key: 'GFA', label: 'Gluten Free Available' },
  { key: 'VEG', label: 'Vegetarian' },
  { key: 'VGN', label: 'Vegan' },
  { key: 'VGNA', label: 'Vegan Available' },
  { key: 'DF', label: 'Dairy Free' },
  { key: 'DFA', label: 'Dairy Free Available' },
];

const SHIFT_TIMES = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 'Other'];

export default function Register({ user, onSubmitted }) {
  const [profile, setProfile] = useState({
    office: '',
    shift_start_time: '',
    dietary_restrictions: [],
    allergies: '',
    other_notes: '',
    photo_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile((p) => ({ ...p, photo_url: file_url }));
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

  const handleSubmit = async () => {
    if (!profile.office) {
      setError('Please select your office location.');
      return;
    }
    setError('');
    setSubmitting(true);

    await base44.auth.updateMe({ ...profile, approval_status: 'pending' });

    // Notify admins
    await base44.functions.invoke('notifyAdminsOfRegistration', {
      userName: user.full_name,
      userEmail: user.email,
      office: profile.office,
    });

    setSubmitting(false);
    onSubmitted();
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#101585]">Welcome to US WIX Breakfast Hub</h1>
          <p className="text-gray-500 mt-2">Complete your profile to request access. An admin will review and approve your account.</p>
        </div>

        {/* Photo & Name */}
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-6 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.photo_url} />
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
            </div>
          </CardContent>
        </Card>

        {/* Office & Shift */}
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <MapPin className="h-4 w-4 text-blue-600" /> Office & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Office Location <span className="text-red-500">*</span></Label>
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
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <UtensilsCrossed className="h-4 w-4 text-blue-600" /> Dietary Restrictions
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
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Food Allergies & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Food Allergies</Label>
              <Textarea
                className="mt-1"
                placeholder="List any food allergies (e.g. peanuts, shellfish, eggs...)"
                value={profile.allergies}
                onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                className="mt-1"
                placeholder="Any other preferences or info Wix should know..."
                value={profile.other_notes}
                onChange={(e) => setProfile((p) => ({ ...p, other_notes: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full py-6 text-base bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? 'Submitting...' : 'Submit Registration for Approval'}
        </Button>
      </div>
    </div>
  );
}