'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatBytes } from '@/lib/file-service';

interface StorageBreakdownCardProps {
  breakdown?: {
    IMAGE: number;
    VIDEO: number;
    AUDIO: number;
    DOCUMENT: number;
    ARCHIVE: number;
    OTHER: number;
  };
  totalUsedBytes?: number;
}

export const StorageBreakdownCard: React.FC<StorageBreakdownCardProps> = ({
  breakdown = { IMAGE: 0, VIDEO: 0, AUDIO: 0, DOCUMENT: 0, ARCHIVE: 0, OTHER: 0 },
  totalUsedBytes = 0,
}) => {
  const categories = [
    { name: 'Images', key: 'IMAGE', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { name: 'Videos', key: 'VIDEO', color: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { name: 'Audio', key: 'AUDIO', color: 'bg-indigo-400', textColor: 'text-indigo-400' },
    { name: 'Documents', key: 'DOCUMENT', color: 'bg-amber-400', textColor: 'text-amber-400' },
    { name: 'Archives', key: 'ARCHIVE', color: 'bg-rose-400', textColor: 'text-rose-400' },
    { name: 'Other', key: 'OTHER', color: 'bg-slate-500', textColor: 'text-slate-400' },
  ] as const;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div>
          <CardTitle>Storage Category Breakdown</CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of file formats stored across the network
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-300">
          Total: {formatBytes(totalUsedBytes)}
        </span>
      </CardHeader>

      <CardContent>
        {/* Multi-segmented Progress Bar */}
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 mb-6 shadow-inner">
          {categories.map((cat) => {
            const bytes = breakdown[cat.key] || 0;
            const percentage = totalUsedBytes > 0 ? (bytes / totalUsedBytes) * 100 : 0;
            if (percentage <= 0) return null;
            return (
              <div
                key={cat.key}
                className={`h-full ${cat.color} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
                title={`${cat.name}: ${formatBytes(bytes)} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
          {totalUsedBytes === 0 && (
            <div className="h-full w-full bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-500">
              No files uploaded yet
            </div>
          )}
        </div>

        {/* Categories Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const bytes = breakdown[cat.key] || 0;
            return (
              <div key={cat.key} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="text-xs font-medium text-slate-300">{cat.name}</span>
                </div>
                <p className="text-sm font-bold text-slate-100 font-mono">{formatBytes(bytes)}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
