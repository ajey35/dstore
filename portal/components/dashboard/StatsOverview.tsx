'use client';

import React from 'react';
import { HardDrive, Files, Download, Network, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface StatsOverviewProps {
  usage: {
    totalUsedFormatted: string;
    quotaFormatted: string;
    percentUsed: number;
    fileCount: number;
  } | null;
  downloadCount: number;
  nodeInfo: {
    connected: boolean;
    peerId?: string;
    peersCount: number;
  } | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  usage,
  downloadCount,
  nodeInfo,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Storage Used */}
      <Card>
        <CardHeader>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <Badge variant="emerald" size="sm">
            {usage ? `${usage.percentUsed.toFixed(1)}% Used` : '0%'}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Storage Used</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">
            {usage ? usage.totalUsedFormatted : '0 B'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 font-mono">
            Quota: {usage ? usage.quotaFormatted : '10 GB'}
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Total Files */}
      <Card>
        <CardHeader>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Files className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-0.5">
            Active CID records
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stored Files</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">
            {usage ? usage.fileCount : 0}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5">Tracked in PostgreSQL</p>
        </CardContent>
      </Card>

      {/* Card 3: Downloads */}
      <Card>
        <CardHeader>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Download className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            Transfers
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">File Downloads</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{downloadCount}</h3>
          <p className="text-xs text-slate-500 mt-1.5">Direct P2P retrieval events</p>
        </CardContent>
      </Card>

      {/* Card 4: Storage Node Status */}
      <Card>
        <CardHeader>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          {nodeInfo?.connected ? (
            <Badge variant="emerald" size="sm">
              Online
            </Badge>
          ) : (
            <Badge variant="amber" size="sm">
              Connecting
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage Node</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">
            {nodeInfo?.connected ? `${nodeInfo.peersCount} Peers` : 'Offline'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 truncate font-mono">
            {nodeInfo?.peerId ? `${nodeInfo.peerId.slice(0, 16)}...` : 'http://127.0.0.1:8080'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
