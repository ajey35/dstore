'use client';

import React, { useState } from 'react';
import { User, KeyRound, Shield, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    quotaBytes?: number;
    createdAt?: string;
  } | null;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setProfileMsg('Profile updated successfully!');
    } catch {
      setProfileMsg('Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PASSWORD_CHANGE',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating password',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Account Details</CardTitle>
              <p className="text-xs text-slate-400">Update your profile info and avatar</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {profileMsg && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> {profileMsg}
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Security & Password</CardTitle>
              <p className="text-xs text-slate-400">Change your portal login password</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            {passwordMsg && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  passwordMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {passwordMsg.text}
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" variant="secondary" isLoading={isUpdatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
