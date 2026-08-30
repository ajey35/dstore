import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import type { NodeInfo, SpaceInfo, StorageFile, PeerConnection } from '../lib/types';

export interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
  dependencies: unknown[] = [],
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, isLoading, error, refetch: execute };
}

export function useNodeInfo(): UseAsyncState<NodeInfo> {
  return useAsync(() => apiClient.getNodeInfo());
}

export function useSpaceInfo(): UseAsyncState<SpaceInfo> {
  return useAsync(() => apiClient.getSpaceInfo());
}

export function useStorageFiles(): UseAsyncState<StorageFile[]> {
  return useAsync(() => apiClient.listFiles());
}

export function usePeers(): UseAsyncState<PeerConnection[]> {
  return useAsync(() => apiClient.getPeers());
}

export function useFileDeletion() {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [deleteError, setDeleteError] = useState<Record<string, Error | null>>({});

  const deleteFile = useCallback(async (cid: string) => {
    setIsDeleting((prev) => ({ ...prev, [cid]: true }));
    setDeleteError((prev) => ({ ...prev, [cid]: null }));

    try {
      await apiClient.deleteFile(cid);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setDeleteError((prev) => ({ ...prev, [cid]: error }));
      return false;
    } finally {
      setIsDeleting((prev) => ({ ...prev, [cid]: false }));
    }
  }, []);

  return { deleteFile, isDeleting, deleteError };
}
