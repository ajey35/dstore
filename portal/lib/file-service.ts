import { db } from './db';
import { storageNodeClient } from './storage-node';

export type FileCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER';

/**
 * Safely converts any BigInt properties in an object or array to numbers for JSON serialization
 */
export function serializeData<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? Number(v) : v))
  );
}

export function detectCategory(mimeType: string, filename: string): FileCategory {
  const mime = mimeType.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'IMAGE';
  }
  if (mime.startsWith('video/') || ['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', 'wmv'].includes(ext)) {
    return 'VIDEO';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
    return 'AUDIO';
  }
  if (
    mime.startsWith('text/') ||
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation') ||
    mime.includes('json') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'json'].includes(ext)
  ) {
    return 'DOCUMENT';
  }
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('compressed') ||
    mime.includes('archive') ||
    ['zip', 'tar', 'gz', 'bz2', '7z', 'rar'].includes(ext)
  ) {
    return 'ARCHIVE';
  }
  return 'OTHER';
}

export function formatBytes(bytes: number | bigint): string {
  const num = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getUserStorageUsage(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { quotaBytes: true },
  });
  if (!user) throw new Error('User not found');

  const files = await db.fileRecord.findMany({
    where: { userId, uploadStatus: 'COMPLETED' },
    select: { size: true, category: true },
  });

  const totalUsed = files.reduce((acc, f) => acc + BigInt(f.size), BigInt(0));
  const quotaBytes = user.quotaBytes;
  const fileCount = files.length;

  // Breakdown by category
  const breakdown: Record<FileCategory, number> = {
    IMAGE: 0,
    VIDEO: 0,
    AUDIO: 0,
    DOCUMENT: 0,
    ARCHIVE: 0,
    OTHER: 0,
  };

  files.forEach((f) => {
    const cat = f.category as FileCategory;
    if (breakdown[cat] !== undefined) {
      breakdown[cat] += Number(f.size);
    } else {
      breakdown.OTHER += Number(f.size);
    }
  });

  return {
    totalUsedBytes: Number(totalUsed),
    totalUsedFormatted: formatBytes(totalUsed),
    quotaBytes: Number(quotaBytes),
    quotaFormatted: formatBytes(quotaBytes),
    percentUsed: Number(quotaBytes) > 0 ? Math.min(100, (Number(totalUsed) / Number(quotaBytes)) * 100) : 0,
    fileCount,
    breakdown,
  };
}

export async function uploadUserFile(
  userId: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  visibility: 'PUBLIC' | 'PRIVATE' = 'PRIVATE'
) {
  const size = BigInt(fileBuffer.length);

  // 1. Quota Check
  const usage = await getUserStorageUsage(userId);
  if (usage.totalUsedBytes + Number(size) > usage.quotaBytes) {
    throw new Error(
      `Upload exceeds available quota. You have ${formatBytes(
        usage.quotaBytes - usage.totalUsedBytes
      )} remaining.`
    );
  }

  const category = detectCategory(mimeType, originalName);

  // 2. Upload binary payload to Archivist Storage Node
  const nodeResult = await storageNodeClient.uploadBinary(fileBuffer, originalName, mimeType);
  if (!nodeResult.success || !nodeResult.cid) {
    throw new Error(nodeResult.error || 'Storage node failed to return Content Identifier (CID)');
  }

  const cid = nodeResult.cid;

  // 3. Write metadata record into database
  const fileRecord = await db.fileRecord.create({
    data: {
      userId,
      name: originalName,
      originalName,
      mimeType,
      size,
      cid,
      uploadStatus: 'COMPLETED',
      visibility,
      category,
    },
  });

  // 4. Create Upload Job log
  await db.uploadJob.create({
    data: {
      userId,
      fileRecordId: fileRecord.id,
      totalBytes: size,
      uploadedBytes: size,
      status: 'COMPLETED',
    },
  });

  // 5. Update Storage Usage Metric
  const updatedUsage = await getUserStorageUsage(userId);
  await db.storageUsageMetric.create({
    data: {
      userId,
      bytesUsed: BigInt(updatedUsage.totalUsedBytes),
      fileCount: updatedUsage.fileCount,
    },
  });

  return serializeData({
    ...fileRecord,
    sizeNumber: Number(fileRecord.size),
    sizeFormatted: formatBytes(fileRecord.size),
  });
}

export async function logDownload(userId: string, fileRecordId: string, bytesDownloaded: bigint, ipAddress?: string, userAgent?: string) {
  return db.downloadEvent.create({
    data: {
      userId,
      fileRecordId,
      bytesDownloaded,
      ipAddress,
      userAgent,
    },
  });
}
