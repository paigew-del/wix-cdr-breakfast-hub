import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users-management'],
    queryFn: () => base44.entities.User.list(),
  });

  const activeUsers = users.filter(u => u.approval_status === 'approved');

  const filtered = activeUsers.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.office?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (user, newRole) => {
    await base44.entities.User.update(user.id, { role: newRole });
    queryClient.invalidateQueries({ queryKey: ['all-users-management'] });
    toast.success(`${user.full_name}'s role updated to ${newRole}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#101585]">Active Users</h1>
        <p className="text-gray-500 mt-1">{activeUsers.length} approved users</p>
      </div>

      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Users className="h-5 w-5 text-blue-600" /> All Active Users
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, office..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm rounded-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 font-medium text-gray-500">Employee</th>
                    <th className="text-left py-3 pr-4 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 pr-4 font-medium text-gray-500">Office</th>
                    <th className="text-left py-3 pr-4 font-medium text-gray-500">Shift</th>
                    <th className="text-left py-3 font-medium text-gray-500">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.photo_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                      <td className="py-3 pr-4 text-gray-700">{u.office || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{u.shift_start_time || '—'}</td>
                      <td className="py-3">
                        <Select
                          value={u.role || 'user'}
                          onValueChange={(val) => handleRoleChange(u, val)}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}