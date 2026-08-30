'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Network, Server, HardDrive, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function NetworkPage() {
  const [nodeData, setNodeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNodeStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/node/status');
      if (res.ok) {
        const json = await res.json();
        setNodeData(json);
      }
    } catch (err) {
      console.error('Node status error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeStatus();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Storage Network Node
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live status, P2P peer count, and node connectivity details
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchNodeStatus}
          >
            Refresh Node
          </Button>
        </div>

        {/* Primary Node Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Server className="w-5 h-5" />
              </div>
              {nodeData?.connected ? (
                <Badge variant="emerald" size="sm">
                  Active Daemon
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Disconnected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Node Status</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                {nodeData?.connected ? 'Online & Listening' : 'Node Unreachable'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 font-mono">
                URL: http://127.0.0.1:8080/api/archivist/v1
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Network className="w-5 h-5" />
              </div>
              <Badge variant="cyan" size="sm">
                LibP2P Swarm
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connected Peers</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                {nodeData?.peersCount || 0} Connected Peers
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">DHT & mDNS discovery enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <Badge variant="indigo" size="sm">
                Software Version
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Archivist Daemon</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                {nodeData?.node?.archivist?.version || 'v0.1.0'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 font-mono">
                Rev: {nodeData?.node?.archivist?.revision?.slice(0, 10) || 'alpha'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Technical Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Node Identifier & Multiaddresses</CardTitle>
          </CardHeader>
          <CardContent>
            {nodeData?.node ? (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Peer Identifier (Peer ID):</span>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 break-all">
                    {nodeData.node.id}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Signed Peer Record (SPR):</span>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 break-all text-[11px]">
                    {nodeData.node.spr || 'N/A'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Listen Multiaddresses:</span>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    {nodeData.node.addrs?.map((addr: string, i: number) => (
                      <div key={i} className="text-emerald-400">
                        {addr}
                      </div>
                    )) || <span className="text-slate-500">No multiaddresses available</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                Archivist storage daemon is offline or starting up.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
