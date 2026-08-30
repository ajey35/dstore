'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, User as UserIcon, Activity, Server } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nodeStatus, setNodeStatus] = useState<{ connected: boolean; peerId?: string } | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});

    fetch('/api/node/status')
      .then((res) => res.json())
      .then((data) => {
        setNodeStatus({
          connected: data.connected,
          peerId: data.node?.id,
        });
      })
      .catch(() => setNodeStatus({ connected: false }));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search files, CIDs, or metadata..."
          onClick={() => router.push('/files')}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Node Connectivity Status Badge */}
        {nodeStatus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Storage Node:</span>
            {nodeStatus.connected ? (
              <Badge variant="emerald" size="sm" className="gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </Badge>
            ) : (
              <Badge variant="amber" size="sm" className="gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Connecting
              </Badge>
            )}
          </div>
        )}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-medium text-slate-200 hidden md:inline">
              {user?.name || 'Account'}
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-800/80">
                <p className="text-sm font-semibold text-slate-100">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => router.push('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/60 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile Settings
              </button>

              <button
                onClick={() => router.push('/analytics')}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/60 flex items-center gap-2.5"
              >
                <Activity className="w-4 h-4 text-slate-400" />
                Usage & Metrics
              </button>

              <div className="border-t border-slate-800/80 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
