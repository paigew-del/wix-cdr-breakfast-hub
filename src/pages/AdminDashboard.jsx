import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart2, Users, Calendar, CheckCircle2, XCircle, Clock,
  AlertCircle, MapPin, ChevronRight, UtensilsCrossed, Upload
} from 'lucide-react';
import UploadMenu from '../components/menu/UploadMenu';
import ManualMenuEntry from '../components/menu/ManualMenuEntry';

const OFFICES = ['New York', 'Cedar Rapids', 'Miami'];

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [activeUploadOffice, setActiveUploadOffice] = useState(null);
  const [activeManualOffice, setActiveManualOffice] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin'));
  }, []);

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!isAdmin,
  });

  const pendingUsers = users.filter(u => u.approval_status === 'pending' || (!u.approval_status && u.office));
  const approvedUsers = users.filter(u => u.approval_status === 'approved');

  const handleApprove = async (user) => {
    await base44.entities.User.update(user.id, { approval_status: 'approved' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your Breakfast Hub Access Has Been Approved!',
      body: `Hi ${user.full_name},\n\nYour registration for the US WIX Breakfast Hub has been approved. You can now log in and access the full app.\n\nWelcome!\nUS WIX Breakfast Hub`
    });
    refetchUsers();
  };

  const handleReject = async (user) => {
    await base44.entities.User.update(user.id, { approval_status: 'rejected' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'US WIX Breakfast Hub – Registration Update',
      body: `Hi ${user.full_name},\n\nUnfortunately your registration for the US WIX Breakfast Hub was not approved at this time. Please reach out to your administrator for more information.\n\nUS WIX Breakfast Hub`
    });
    refetchUsers();
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
      <div>
        <h1 className="text-3xl font-bold text-[#101585]">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage menus, users, and view reporting</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-blue-100 rounded-xl p-3"><Users className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedUsers.length}</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-orange-200 shadow-sm bg-orange-50">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-orange-100 rounded-xl p-3"><Clock className="h-6 w-6 text-orange-500" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              <p className="text-sm text-gray-500">Pending Approvals</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-purple-100 rounded-xl p-3"><UtensilsCrossed className="h-6 w-6 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{OFFICES.length}</p>
              <p className="text-sm text-gray-500">Office Locations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/Analytics" className="group">
          <Card className="rounded-2xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="bg-amber-100 rounded-xl p-4 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-7 w-7 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Analytics & Reporting</h3>
                <p className="text-sm text-gray-500">View feedback trends, ratings, and dietary reports</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/FeedbackForm" className="group">
          <Card className="rounded-2xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="bg-green-100 rounded-xl p-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Forms</h3>
                <p className="text-sm text-gray-500">View and manage employee feedback submissions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </CardContent>
          </Card>
        </Link>
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
                    <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
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
                    + Add Manually
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
              <div key={u.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-100">
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
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
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

      {/* Current Users List */}
      <Card className="rounded-2xl border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Users className="h-5 w-5 text-blue-600" /> Current Users ({approvedUsers.length})
          </CardTitle>
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
    </div>
  );
}