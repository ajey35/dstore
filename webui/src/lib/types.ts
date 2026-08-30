/**
 * API Types for Archivist Storage Network
 */

export interface NodeInfo {
  id: string;
  addrs: string[];
  repo?: string;
  spr?: string;
  announceAddresses: string[];
  ethAddress?: string;
  archivist?: ArchivistInfo;
}

export interface ArchivistInfo {
  version: string;
  revision?: string;
  contracts?: string;
}

export interface DataItem {
  cid: string;
  manifest?: {
    treeCid: string;
    datasetSize: number;
    blockSize: number;
    protected: boolean;
    filename?: string;
    mimetype?: string;
  };
}

export interface DataList {
  content: DataItem[];
}

export interface SpaceInfo {
  totalBlocks: number;
  quotaMaxBytes: number;
  quotaUsedBytes: number;
  quotaReservedBytes: number;
}

export interface PeerConnection {
  peerId: string;
  addresses: string[];
  lastSeen?: number;
  latency?: number;
}

export interface StorageFile {
  id: string;
  name: string;
  cid: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedAt: number;
  status: 'synced' | 'syncing' | 'pending' | 'failed';
  replicas: number;
  protected: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  speed: number;
  eta: number;
  status: 'uploading' | 'verifying' | 'complete' | 'error';
  error?: string;
}

export interface AuthSession {
  userId: string;
  peerId: string;
  sessionToken: string;
  expiresAt: number;
}

export interface User {
  id: string;
  email?: string;
  peerId: string;
  createdAt: number;
  storageQuota: number;
  storageUsed: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}
