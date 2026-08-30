import type {
  ApiError,
  DataList,
  DataItem,
  NodeInfo,
  PeerConnection,
  SpaceInfo,
  StorageFile,
  UploadProgress,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/archivist/v1';
const TIMEOUT = 30000;

// Debug logging
console.log('[API Client] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Client] API_BASE_URL:', API_BASE_URL);
console.log('[API Client] MODE:', import.meta.env.MODE);

export class ArchivistApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData: ApiError = {
          code: `HTTP_${response.status}`,
          message: text || response.statusText,
          status: response.status,
        };

        try {
          errorData = JSON.parse(text);
        } catch {
          // response was plain text
        }

        throw new Error(JSON.stringify(errorData));
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json() as T;
      }

      return await response.text() as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getNodeInfo(): Promise<NodeInfo> {
    try {
      return await this.fetch<NodeInfo>('/debug/info');
    } catch (error) {
      // Provide more detailed error information for connection issues
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(
            `Cannot connect to Archivist node at ${this.baseUrl}/debug/info. ` +
            `Please ensure:\n` +
            `1. The archivist-node is running\n` +
            `2. The API is accessible on port 8080\n` +
            `3. CORS is properly configured if accessing from a different origin`
          );
        }
      }
      throw error;
    }
  }

  async getSpaceInfo(): Promise<SpaceInfo> {
    return this.fetch<SpaceInfo>('/space');
  }

  async listFiles(): Promise<StorageFile[]> {
    const data = await this.fetch<DataList>('/data');
    return data.content.map((item) => this.mapDataItemToFile(item));
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const xhr = new XMLHttpRequest();
      const uploadProgress: UploadProgress = {
        fileId: Math.random().toString(36).substring(7),
        fileName: file.name,
        progress: 0,
        speed: 0,
        eta: 0,
        status: 'uploading',
      };

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            const speed = event.loaded / ((Date.now() - xhr.startTime) / 1000);
            const eta = (event.total - event.loaded) / speed;

            uploadProgress.progress = progress;
            uploadProgress.speed = speed;
            uploadProgress.eta = eta;
            onProgress?.(uploadProgress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            uploadProgress.status = 'complete';
            uploadProgress.progress = 100;
            onProgress?.(uploadProgress);
            resolve(xhr.responseText.trim());
          } else {
            uploadProgress.status = 'error';
            uploadProgress.error = `Upload failed: ${xhr.statusText}`;
            onProgress?.(uploadProgress);
            reject(new Error(xhr.responseText || xhr.statusText));
          }
        });

        xhr.addEventListener('error', () => {
          uploadProgress.status = 'error';
          uploadProgress.error = 'Upload failed';
          onProgress?.(uploadProgress);
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          uploadProgress.status = 'error';
          uploadProgress.error = 'Upload cancelled';
          onProgress?.(uploadProgress);
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `${this.baseUrl}/data`);
        xhr.setRequestHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.startTime = Date.now();
        xhr.send(file);
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async downloadFile(cid: string): Promise<Blob> {
    const url = `${this.baseUrl}/data/${cid}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return response.blob();
  }

  async deleteFile(cid: string): Promise<void> {
    await this.fetch(`/data/${cid}`, { method: 'DELETE' });
  }

  async getPeers(): Promise<PeerConnection[]> {
    const data = await this.fetch<{ peers: PeerConnection[] }>('/peers');
    return data.peers || [];
  }

  async connectPeer(peerId: string, addresses?: string[]): Promise<void> {
    const url = `/connect/${peerId}${addresses ? `?${addresses.map((addr) => `addrs[]=${encodeURIComponent(addr)}`).join('&')}` : ''
      }`;
    await this.fetch(url, { method: 'POST' });
  }

  async disconnectPeer(peerId: string): Promise<void> {
    await this.fetch(`/disconnect/${peerId}`, { method: 'POST' });
  }

  async runDiagnostics(): Promise<Record<string, unknown>> {
    return this.fetch<Record<string, unknown>>('/debug/diagnostics');
  }

  private mapDataItemToFile(item: DataItem): StorageFile {
    const manifest = item.manifest;
    return {
      id: item.cid,
      name: manifest?.filename || item.cid.substring(0, 16),
      cid: item.cid,
      size: manifest?.datasetSize || 0,
      sizeFormatted: this.formatBytes(manifest?.datasetSize || 0),
      mimeType: manifest?.mimetype || 'application/octet-stream',
      uploadedAt: Date.now(),
      status: 'synced',
      replicas: 3,
      protected: manifest?.protected || false,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const apiClient = new ArchivistApiClient();
