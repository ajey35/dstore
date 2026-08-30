import { NextResponse } from 'next/server';
import { storageNodeClient } from '@/lib/storage-node';

export async function GET() {
  const nodeInfo = await storageNodeClient.getNodeInfo();
  const spaceInfo = await storageNodeClient.getSpaceInfo();
  const peersInfo = await storageNodeClient.getPeers();

  return NextResponse.json({
    connected: nodeInfo.success,
    node: nodeInfo.data || null,
    space: spaceInfo.data || null,
    peersCount: peersInfo.peers?.length || 0,
    error: nodeInfo.error || spaceInfo.error || null,
  });
}
