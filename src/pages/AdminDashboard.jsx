import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  BarChart2, Users, CalendarDays, CheckCircle2, XCircle, Clock,
  AlertCircle, MapPin, ChevronRight, UtensilsCrossed, Upload,
  UserPlus, Mail, MessageSquare, Download, ShieldAlert
} from 'lucide-react';
import UploadMenu from '../components/menu/UploadMenu';
import ManualMenuEntry from '../components/menu/ManualMenuEntry';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const OFFICES = ['New York', 'Cedar Rapids', 'Miami'];
const OFFICE_COLORS = { 'New York': '#3b82f6', 'Cedar Rapids': '#8b5cf6', 'Miami': '#f59e0b' };

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [activeUploadOffice, setActiveUploadOffice] = useState(null);
  const [activeManualOffice, setActiveManualOffice] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin'));
  }, []);

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!isAdmin,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['admin-feedback-recent'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 5),
    enabled: !!isAdmin,
  });

  const pendingUsers = users.filter(u => u.approval_status === 'pending' || (!u.approval_status && u.office));
  const approvedUsers = users.filter(u => u.approval_status === 'approved');

  const usersByOffice = OFFICES.map(office => ({
    office,
    count: approvedUsers.filter(u => u.office === office).length,
  }));

  const handleApprove = async (user) => {
    await base44.entities.User.update(user.id, { approval_status: 'approved' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your Breakfast Hub Access Has Been Approved!',
      body: `Hi ${user.full_name},\n\nYour registration for the US WIX Breakfast Hub has been approved. You can now log in and access the full app.\n\nWelcome!\nUS WIX Breakfast Hub`
    });
    refetchUsers();
    toast.success(`${user.full_name} approved`);
  };

  const handleReject = async (user) => {
    await base44.entities.User.update(user.id, { approval_status: 'rejected' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'US WIX Breakfast Hub – Registration Update',
      body: `Hi ${user.full_name},\n\nUnfortunately your registration for the US WIX Breakfast Hub was not approved at this time. Please reach out to your administrator for more information.\n\nUS WIX Breakfast Hub`
    });
    refetchUsers();
    toast.success(`${user.full_name} rejected`);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'user');
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleExportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Office', 'Shift', 'Role', 'Dietary Restrictions', 'Allergies'],
      ...approvedUsers.map(u => [
        u.full_name || '',
        u.email || '',
        u.office || '',
        u.shift_start_time || '',
        u.role || 'user',
        (u.dietary_restrictions || []).join('; '),
        u.allergies || ''
      ])
    ].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-slate-600">Only administrators can view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101585]">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage menus, users, and view reporting</p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            {pendingUsers.length} pending approval{pendingUsers.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <div className="bg-blue-100 rounded-xl p-2.5"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedUsers.length}</p>
              <p className="text-xs text-gray-500">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-orange-200 shadow-sm bg-orange-50">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <div className="bg-orange-100 rounded-xl p-2.5"><Clock className="h-5 w-5 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <div className="bg-purple-100 rounded-xl p-2.5"><UtensilsCrossed className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{OFFICES.length}</p>
              <p className="text-xs text-gray-500">Offices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/Analytics', icon: BarChart2, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: 'Analytics', desc: 'Feedback trends & reports' },
          { to: '/MenuCalendar', icon: CalendarDays, iconBg: 'bg-green-100', iconColor: 'text-green-600', title: 'Menu Calendar', desc: 'View & edit menus' },
            { to: '/FeedbackForm', icon: MessageSquare, iconBg: 'bg-pink-100', iconColor: 'text-pink-600', title: 'Feedback', desc: 'Employee submissions' },
        ].map(({ to, icon: Icon, iconBg, iconColor, title, desc }) => (
          <Link to={to} key={to} className="group">
            <Card className="rounded-2xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <div className={`${iconBg} rounded-xl p-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 truncate">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="rounded-2xl border-orange-200 bg-orange-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-100 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.photo_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{u.full_name}</p>
                    <p className="text-sm text-gray-500">{u.email} · {u.office || 'No office'}</p>
                    {u.dietary_restrictions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.dietary_restrictions.map(r => (
                          <span key={r} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full" onClick={() => handleApprove(u)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 rounded-full" onClick={() => handleReject(u)}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Users by Office */}
      <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <MapPin className="h-5 w-5 text-blue-600" /> Users by Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usersByOffice} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="office" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {usersByOffice.map((entry) => (
                    <Cell key={entry.office} fill={OFFICE_COLORS[entry.office] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center flex-wrap">
              {usersByOffice.map(({ office, count }) => (
                <div key={office} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: OFFICE_COLORS[office] }} />
                  {office}: <strong>{count}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Upload by Office */}
      <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Upload className="h-5 w-5 text-blue-600" /> Upload Menu by Office
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {OFFICES.map(office => (
            <div key={office} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{office}</span>
                  <span className="text-xs text-gray-400">
                    {approvedUsers.filter(u => u.office === office).length} users
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeUploadOffice === office ? 'outline' : 'default'}
                    className="rounded-full"
                    onClick={() => {
                      setActiveUploadOffice(activeUploadOffice === office ? null : office);
                      setActiveManualOffice(null);
                    }}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" /> CSV
                  </Button>
                  <Button
                    size="sm"
                    variant={activeManualOffice === office ? 'outline' : 'default'}
                    className="rounded-full bg-[#101585] hover:bg-[#0d1170]"
                    onClick={() => {
                      setActiveManualOffice(activeManualOffice === office ? null : office);
                      setActiveUploadOffice(null);
                    }}
                  >
                    + Manual
                  </Button>
                </div>
              </div>
              {activeUploadOffice === office && (
                <div className="p-4 border-t border-gray-200">
                  <UploadMenu office={office} onUploadComplete={() => setActiveUploadOffice(null)} />
                </div>
              )}
              {activeManualOffice === office && (
                <div className="p-4 border-t border-gray-200">
                  <ManualMenuEntry
                    office={office}
                    onSaveComplete={() => setActiveManualOffice(null)}
                    onCancel={() => setActiveManualOffice(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite User + Current Users */}
      <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Users className="h-5 w-5 text-blue-600" /> Users ({approvedUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Invite by email..."
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  className="w-52 h-8 text-sm rounded-full"
                />
                <Button size="sm" className="rounded-full bg-[#101585] hover:bg-[#0d1170]" onClick={handleInvite} disabled={inviting}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> {inviting ? 'Sending...' : 'Invite'}
                </Button>
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={handleExportUsers}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Employee</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Office</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Shift</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Dietary</th>
                  <th className="text-left py-2 font-medium text-gray-500">Role</th>
                </tr>
              </thead>
              <tbody>
                {approvedUsers.map((u, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.photo_url} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{u.full_name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{u.office || '—'}</td>
                    <td className="py-3 pr-4 text-gray-700">{u.shift_start_time || '—'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {u.dietary_restrictions?.length > 0
                          ? u.dietary_restrictions.map((r, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{r}</span>
                            ))
                          : <span className="text-gray-400 text-xs">None</span>
                        }
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
                {approvedUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No approved users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      {feedback.length > 0 && (
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <MessageSquare className="h-5 w-5 text-pink-500" /> Recent Feedback
            </CardTitle>
            <Link to="/Analytics">
              <Button variant="outline" size="sm" className="rounded-full text-xs">View All <ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.map((f, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <div className="bg-pink-100 rounded-lg p-2 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{f.employeeName || 'Anonymous'}</p>
                      <span className="text-xs text-gray-400">{f.dateOfBreakfast}</span>
                      {f.varietyRating && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">⭐ {f.varietyRating}/5 variety</span>
                      )}
                    </div>
                    {f.menuSuggestions && (
                      <p className="text-xs text-gray-600 mt-1 truncate">💡 {f.menuSuggestions}</p>
                    )}
                    {f.otherFeedback && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{f.otherFeedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}