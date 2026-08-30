export interface NodeInfo {
  id: string;
  addrs?: string[];
  repo?: string;
  spr?: string;
  announceAddresses?: string[];
  ethAddress?: string;
  archivist?: {
    version: string;
    revision?: string;
    contracts?: string;
  };
}

export interface SpaceInfo {
  totalBlocks: number;
  quotaMaxBytes: number;
  quotaUsedBytes: number;
  quotaReservedBytes: number;
}

export interface NodePeer {
  id: string;
  addrs: string[];
  connected: boolean;
}

export class ArchivistStorageNodeClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.STORAGE_NODE_URL || 'http://127.0.0.1:8080/api/archivist/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Fetch details about the running storage node instance
   */
  async getNodeInfo(): Promise<{ success: boolean; data?: NodeInfo; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/debug/info`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to connect to Archivist storage node',
      };
    }
  }

  /**
   * Fetch storage space metrics directly from network node
   */
  async getSpaceInfo(): Promise<{ success: boolean; data?: SpaceInfo; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/space`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to query node space metrics',
      };
    }
  }

  /**
   * Upload binary data directly to the Archivist storage node
   * Header requirement: Content-Disposition: attachment; filename="..."
   */
  async uploadBinary(
    fileBuffer: Buffer | ArrayBuffer | Uint8Array,
    filename: string,
    mimeType: string = 'application/octet-stream'
  ): Promise<{ success: boolean; cid?: string; error?: string }> {
    try {
      const sanitizedFilename = filename.replace(/["\r\n]/g, '_');
      const res = await fetch(`${this.baseUrl}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        },
        body: fileBuffer as BodyInit,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Node Upload Failed (${res.status}): ${text || res.statusText}`);
      }

      const cid = (await res.text()).trim();
      if (!cid) throw new Error('Storage node returned empty Content Identifier (CID)');
      return { success: true, cid };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to transfer file to storage network',
      };
    }
  }

  /**
   * Download binary data stream from storage node by CID
   */
  async downloadBinary(cid: string): Promise<Response> {
    const res = await fetch(`${this.baseUrl}/data/${cid}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to retrieve file ${cid} from node (HTTP ${res.status})`);
    }
    return res;
  }

  /**
   * Delete content from local node by CID
   */
  async deleteFile(cid: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/data/${cid}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Delete failed (HTTP ${res.status})`);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete file from node',
      };
    }
  }

  /**
   * Fetch connected peers list from storage node
   */
  async getPeers(): Promise<{ success: boolean; peers?: NodePeer[]; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/peers`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, peers: json.peers || [] };
    } catch (err) {
      return {
        success: false,
        peers: [],
        error: err instanceof Error ? err.message : 'Failed to fetch peers',
      };
    }
  }
}

export const storageNodeClient = new ArchivistStorageNodeClient();
