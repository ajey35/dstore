import { useCallback, useState } from 'react';
import { apiClient } from '../lib/api';
import type { UploadProgress } from '../lib/types';

export interface UploadState {
  activeUploads: Map<string, UploadProgress>;
  addUpload: (file: File) => void;
  cancelUpload: (fileId: string) => void;
  clearCompleted: () => void;
}

export function useUpload(): UploadState {
  const [activeUploads, setActiveUploads] = useState<Map<string, UploadProgress>>(new Map());

  const addUpload = useCallback(async (file: File) => {
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const initialProgress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      speed: 0,
      eta: 0,
      status: 'uploading',
    };

    setActiveUploads((prev) => new Map(prev).set(fileId, initialProgress));

    try {
      await apiClient.uploadFile(file, (progress) => {
        setActiveUploads((prev) => new Map(prev).set(fileId, progress));
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setActiveUploads((prev) => {
        const updated = new Map(prev);
        const current = updated.get(fileId);
        if (current) {
          updated.set(fileId, {
            ...current,
            status: 'error',
            error: error.message,
          });
        }
        return updated;
      });
    }
  }, []);

  const cancelUpload = useCallback((fileId: string) => {
    setActiveUploads((prev) => {
      const updated = new Map(prev);
      const current = updated.get(fileId);
      if (current && current.status === 'uploading') {
        updated.set(fileId, {
          ...current,
          status: 'error',
          error: 'Cancelled by user',
        });
      }
      return updated;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setActiveUploads((prev) => {
      const updated = new Map(prev);
      for (const [fileId, progress] of updated.entries()) {
        if (progress.status === 'complete' || progress.status === 'error') {
          updated.delete(fileId);
        }
      }
      return updated;
    });
  }, []);

  return {
    activeUploads,
    addUpload,
    cancelUpload,
    clearCompleted,
  };
}
