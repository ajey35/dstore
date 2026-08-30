import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { storageNodeClient } from '@/lib/storage-node';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const file = await db.fileRecord.findFirst({
    where: { id, userId: user.id },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const response = await storageNodeClient.downloadBinary(file.cid);

    const headers = new Headers();
    headers.set('Content-Type', file.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Preview proxy error:', error);
    return NextResponse.json({ error: 'Failed to load preview stream' }, { status: 502 });
  }
}
