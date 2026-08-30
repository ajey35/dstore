'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HardDrive, Download, Upload, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Usage Analytics & Activity
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Historical metrics, bandwidth usage, and storage allocation breakdown
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchAnalytics}
          >
            Refresh
          </Button>
        </div>

        {/* Quota Usage Banner Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Total Account Quota Allocation</CardTitle>
                <p className="text-xs text-slate-400">
                  Current usage across all registered storage node CIDs
                </p>
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {data?.usage ? `${data.usage.percentUsed.toFixed(1)}% Used` : '0%'}
            </span>
          </CardHeader>

          <CardContent>
            <ProgressBar
              value={data?.usage ? data.usage.percentUsed : 0}
              size="lg"
              color="emerald"
              sublabel={
                data?.usage
                  ? `${data.usage.totalUsedFormatted} used of ${data.usage.quotaFormatted} total`
                  : '0 B / 10 GB'
              }
            />
          </CardContent>
        </Card>

        {/* Activity Logs Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Activity Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <CardTitle>Recent File Uploads</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data?.recentUploads?.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No uploads recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.recentUploads?.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">CID: {u.cid}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          {u.sizeFormatted}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Transfer Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <CardTitle>Recent Download Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data?.recentDownloads?.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No downloads recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.recentDownloads?.map((d: any) => (
                    <div
                      key={d.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {d.fileName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono truncate">CID: {d.cid}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-cyan-400 font-semibold">
                          {d.bytesFormatted}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
