import React from 'react';
import { Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PendingApproval({ user }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full space-y-5">
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-4">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#101585]">Approval Pending</h1>
        <p className="text-gray-500">
          Thank you, <strong>{user?.full_name}</strong>! Your registration has been submitted.<br /><br />
          An administrator will review your profile and you'll receive access once approved.
        </p>
        <p className="text-sm text-gray-400">You can close this window and check back later.</p>
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => base44.auth.logout()}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}