import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadUserFile, formatBytes, serializeData } from '@/lib/file-service';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const visibility = searchParams.get('visibility') || '';

  const whereClause: any = {
    userId: user.id,
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { originalName: { contains: search } },
      { cid: { contains: search } },
    ];
  }

  if (category && category !== 'ALL') {
    whereClause.category = category;
  }

  if (visibility && visibility !== 'ALL') {
    whereClause.visibility = visibility;
  }

  const files = await db.fileRecord.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  const formattedFiles = files.map((file) => ({
    id: file.id,
    name: file.name,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: Number(file.size),
    sizeFormatted: formatBytes(file.size),
    cid: file.cid,
    uploadStatus: file.uploadStatus,
    visibility: file.visibility,
    category: file.category,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }));

  return NextResponse.json(serializeData({ files: formattedFiles }));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const visibility = (formData.get('visibility') as 'PUBLIC' | 'PRIVATE') || 'PRIVATE';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const record = await uploadUserFile(
      user.id,
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      visibility
    );

    return NextResponse.json(serializeData({ success: true, file: record }));
  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'File upload failed' },
      { status: 500 }
    );
  }
}
