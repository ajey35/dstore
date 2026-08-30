'use client';

import React, { useEffect, useState } from 'react';
import { UploadCloud, HardDrive, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { StorageBreakdownCard } from '@/components/dashboard/StorageBreakdownCard';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { UploadModal } from '@/components/files/UploadModal';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [nodeData, setNodeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, nodeRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/node/status'),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalyticsData(aData);
      }

      if (nodeRes.ok) {
        const nData = await nodeRes.json();
        setNodeData(nData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Storage Overview</h1>
            <p className="text-xs text-slate-400 mt-1">
              Central customer portal metrics and network node status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={loadDashboardData}
            >
              Refresh
            </Button>
            <Button
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload File
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsOverview
          usage={analyticsData?.usage || null}
          downloadCount={analyticsData?.totalDownloadsCount || 0}
          nodeInfo={
            nodeData
              ? {
                  connected: nodeData.connected,
                  peerId: nodeData.node?.id,
                  peersCount: nodeData.peersCount || 0,
                }
              : null
          }
        />

        {/* Storage Category Breakdown */}
        <StorageBreakdownCard
          breakdown={analyticsData?.usage?.breakdown}
          totalUsedBytes={analyticsData?.usage?.totalUsedBytes}
        />

        {/* Activity Feed */}
        <RecentActivityFeed
          uploads={analyticsData?.recentUploads}
          downloads={analyticsData?.recentDownloads}
        />

        {/* Upload Modal */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      </div>
    </AppLayout>
  );
}
