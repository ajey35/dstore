'use client';

import React from 'react';
import { UploadCloud, DownloadCloud, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface ActivityItem {
  id: string;
  name?: string;
  fileName?: string;
  cid: string;
  size?: number;
  bytesDownloaded?: number;
  createdAt: string;
  type: 'upload' | 'download';
}

interface RecentActivityFeedProps {
  uploads?: ActivityItem[];
  downloads?: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  uploads = [],
  downloads = [],
}) => {
  const combined: ActivityItem[] = [
    ...uploads.map((u) => ({ ...u, type: 'upload' as const })),
    ...downloads.map((d) => ({ ...d, name: d.fileName, type: 'download' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent Activity Feed</CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time file uploads and download events across your storage account
          </p>
        </div>
        <Link
          href="/analytics"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        {combined.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No recent file activity recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {combined.slice(0, 6).map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      item.type === 'upload'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {item.type === 'upload' ? (
                      <UploadCloud className="w-4 h-4" />
                    ) : (
                      <DownloadCloud className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {item.name || item.fileName || 'Unnamed File'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">CID: {item.cid}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.type === 'upload'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {item.type === 'upload' ? 'Upload' : 'Download'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
