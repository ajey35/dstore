import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { storageNodeClient } from '@/lib/storage-node';
import { formatBytes } from '@/lib/file-service';

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

  return NextResponse.json({
    file: {
      ...file,
      sizeNumber: Number(file.size),
      sizeFormatted: formatBytes(file.size),
    },
  });
}

export async function DELETE(
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

  // Attempt delete from underlying storage node
  await storageNodeClient.deleteFile(file.cid);

  // Remove database record
  await db.fileRecord.delete({
    where: { id: file.id },
  });

  return NextResponse.json({ success: true, message: 'File deleted successfully' });
}
