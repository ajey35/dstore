'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HardDrive,
  BarChart3,
  Network,
  User,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [usage, setUsage] = useState<{
    totalUsedFormatted: string;
    quotaFormatted: string;
    percentUsed: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.usage) {
          setUsage(data.usage);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Storage Browser', href: '/files', icon: HardDrive },
    { name: 'Analytics & Activity', href: '/analytics', icon: BarChart3 },
    { name: 'Storage Network', href: '/network', icon: Network },
    { name: 'Profile & Account', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Database className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-100 tracking-tight text-base">Archivist</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Decentralized Storage</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Storage Metric */}
      <div className="p-4 m-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Storage Quota</span>
        </div>
        <ProgressBar
          value={usage ? usage.percentUsed : 0}
          color="emerald"
          size="sm"
          sublabel={
            usage
              ? `${usage.totalUsedFormatted} / ${usage.quotaFormatted}`
              : '0 B / 10 GB'
          }
        />
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Encryption</span>
          <span className="text-emerald-400 font-medium">AES-256 / CID</span>
        </div>
      </div>
    </aside>
  );
};
