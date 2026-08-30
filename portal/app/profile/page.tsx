'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, credentials, and portal security options
          </p>
        </div>

        <ProfileForm user={user} />
      </div>
    </AppLayout>
  );
}
