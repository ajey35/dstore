import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUserStorageUsage, formatBytes, serializeData } from '@/lib/file-service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = await getUserStorageUsage(user.id);

  // Fetch recent uploads
  const recentUploads = await db.fileRecord.findMany({
    where: { userId: user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch recent downloads
  const recentDownloads = await db.downloadEvent.findMany({
    where: { userId: user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      fileRecord: {
        select: { name: true, cid: true, mimeType: true },
      },
    },
  });

  // Total downloads count
  const totalDownloadsCount = await db.downloadEvent.count({
    where: { userId: user.id },
  });

  return NextResponse.json(
    serializeData({
      usage,
      totalDownloadsCount,
      recentUploads: recentUploads.map((f) => ({
        id: f.id,
        name: f.name,
        cid: f.cid,
        size: Number(f.size),
        sizeFormatted: formatBytes(f.size),
        category: f.category,
        createdAt: f.createdAt,
      })),
      recentDownloads: recentDownloads.map((d) => ({
        id: d.id,
        fileName: d.fileRecord?.name || 'Unknown',
        cid: d.fileRecord?.cid || '',
        bytesDownloaded: Number(d.bytesDownloaded),
        bytesFormatted: formatBytes(d.bytesDownloaded),
        createdAt: d.createdAt,
      })),
    })
  );
}
