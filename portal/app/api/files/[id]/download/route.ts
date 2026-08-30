import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { storageNodeClient } from '@/lib/storage-node';
import { logDownload } from '@/lib/file-service';

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

    // Log download metrics
    const ip = req.headers.get('x-forwarded-for') || undefined;
    const ua = req.headers.get('user-agent') || undefined;
    await logDownload(user.id, file.id, file.size, ip, ua);

    const headers = new Headers();
    headers.set('Content-Type', file.mimeType || 'application/octet-stream');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );
    if (file.size) {
      headers.set('Content-Length', file.size.toString());
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download route error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file from storage network' },
      { status: 502 }
    );
  }
}
