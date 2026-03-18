import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Package, AlertCircle, TrendingUp, Download, Calendar, Users, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import MetricCard from '../components/analytics/MetricCard';
import { format, parseISO, subDays } from 'date-fns';

export default function Analytics() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await base44.auth.me();
      setIsAdmin(user.role === 'admin');
    };
    checkAdmin();
  }, []);

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', dateRange],
    queryFn: async () => {
      const allFeedback = await base44.entities.Feedback.list('-created_date');
      return allFeedback.filter(f => {
        const fDate = new Date(f.dateOfBreakfast);
        return fDate >= new Date(dateRange.start) && fDate <= new Date(dateRange.end);
      });
    }
  });

  const { data: menuDays = [] } = useQuery({
    queryKey: ['menuDays'],
    queryFn: () => base44.entities.MenuDay.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-slate-600">Only administrators can view analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const avgVariety = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.varietyRating || 0), 0) / feedback.length).toFixed(1)
    : '0.0';

  const avgAllergies = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.allergiesHandledRating || 0), 0) / feedback.length).toFixed(1)
    : '0.0';

  const stockingData = {
    Yes: feedback.filter(f => f.stockedAppropriately === 'Yes').length,
    Somewhat: feedback.filter(f => f.stockedAppropriately === 'Somewhat').length,
    No: feedback.filter(f => f.stockedAppropriately === 'No').length
  };

  // Variety rating over time
  const varietyOverTime = feedback.reduce((acc, f) => {
    const date = format(new Date(f.dateOfBreakfast), 'MMM d');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += f.varietyRating || 0;
      existing.count += 1;
      existing.avg = existing.total / existing.count;
    } else {
      acc.push({
        date,
        total: f.varietyRating || 0,
        count: 1,
        avg: f.varietyRating || 0
      });
    }
    return acc;
  }, []);

  // Allergy rating over time
  const allergyOverTime = feedback.reduce((acc, f) => {
    const date = format(new Date(f.dateOfBreakfast), 'MMM d');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += f.allergiesHandledRating || 0;
      existing.count += 1;
      existing.avg = existing.total / existing.count;
    } else {
      acc.push({
        date,
        total: f.allergiesHandledRating || 0,
        count: 1,
        avg: f.allergiesHandledRating || 0
      });
    }
    return acc;
  }, []);

  const pieData = [
    { name: 'Yes', value: stockingData.Yes, color: '#10b981' },
    { name: 'Somewhat', value: stockingData.Somewhat, color: '#f59e0b' },
    { name: 'No', value: stockingData.No, color: '#ef4444' }
  ];

  // Categorize suggestions
  const suggestions = feedback
    .filter(f => f.menuSuggestions)
    .map(f => f.menuSuggestions);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Employee', 'Shift', 'Variety Rating', 'Allergy Rating', 'Stocked', 'Suggestions', 'Other Feedback'],
      ...feedback.map(f => [
        f.dateOfBreakfast,
        f.employeeName || 'Anonymous',
        f.shiftType || '',
        f.varietyRating || '',
        f.allergiesHandledRating || '',
        f.stockedAppropriately || '',
        f.menuSuggestions || '',
        f.otherFeedback || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics & Reporting</h1>
          <p className="text-slate-600 mt-1">Breakfast catering insights</p>
        </div>
        <Button onClick={handleExport} className="bg-amber-600 hover:bg-amber-700">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Avg Variety Rating"
          value={avgVariety}
          icon={Star}
          color="bg-amber-600"
          subtitle={`out of 5.0 (${feedback.length} responses)`}
        />
        <MetricCard
          title="Avg Allergy Handling"
          value={avgAllergies}
          icon={AlertCircle}
          color="bg-teal-600"
          subtitle={`out of 5.0 (${feedback.length} responses)`}
        />
        <MetricCard
          title="Total Responses"
          value={feedback.length}
          icon={TrendingUp}
          color="bg-blue-600"
          subtitle={`${format(new Date(dateRange.start), 'MMM d')} - ${format(new Date(dateRange.end), 'MMM d')}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variety Over Time */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Variety Rating Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={varietyOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Allergy Handling Over Time */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Allergy Handling Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={allergyOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stocking Distribution */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Stocking Appropriateness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Menu Suggestions */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Menu Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.slice(0, 10).map((suggestion, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">{suggestion}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No suggestions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Dietary Restrictions & Allergy Report */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Employee Dietary Restrictions & Allergies
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const usersWithNeeds = users.filter(u => (u.dietary_restrictions?.length > 0) || u.allergies);
              const csvContent = [
                ['Name', 'Email', 'Office', 'Dietary Restrictions', 'Food Allergies', 'Additional Notes'],
                ...usersWithNeeds.map(u => [
                  u.full_name || '',
                  u.email || '',
                  u.office || '',
                  (u.dietary_restrictions || []).join('; '),
                  u.allergies || '',
                  u.other_notes || ''
                ])
              ].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'dietary-restrictions-report.csv';
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {users.filter(u => (u.dietary_restrictions?.length > 0) || u.allergies).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No users have filled in dietary restrictions or allergies yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-4 font-medium text-slate-600">Employee</th>
                    <th className="text-left py-2 pr-4 font-medium text-slate-600">Office</th>
                    <th className="text-left py-2 pr-4 font-medium text-slate-600">Dietary Restrictions</th>
                    <th className="text-left py-2 font-medium text-slate-600">Food Allergies</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => (u.dietary_restrictions?.length > 0) || u.allergies)
                    .map((u, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{u.full_name || '—'}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{u.office || '—'}</td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {(u.dietary_restrictions || []).map((r, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{r}</span>
                            ))}
                            {(!u.dietary_restrictions || u.dietary_restrictions.length === 0) && <span className="text-slate-400 text-xs">None</span>}
                          </div>
                        </td>
                        <td className="py-3 text-slate-700">{u.allergies || <span className="text-slate-400">None listed</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}