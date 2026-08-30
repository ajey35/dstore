'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, File, Globe, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('0 MB/s');
  const [error, setError] = useState<string | null>(null);
  const [successCid, setSuccessCid] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccessCid(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
      setSuccessCid(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('visibility', visibility);

      // Simulate XHR progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = (selectedFile.size * (prev / 100)) / elapsed / (1024 * 1024);
          setUploadSpeed(`${speed.toFixed(2)} MB/s`);
          return prev + 15;
        });
      }, 300);

      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'File upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);
      setSuccessCid(data.file.cid);
      setIsUploading(false);
      onSuccess();
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Failed to upload file to network');
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccessCid(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Upload File to Storage Network"
    >
      {successCid ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-100">Upload Complete!</h4>
          <p className="text-xs text-slate-400 mt-1">
            File stored on network & registered in database.
          </p>
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 break-all">
            <span className="text-slate-500 block mb-1">Generated Network CID:</span>
            {successCid}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                resetState();
              }}
            >
              Upload Another
            </Button>
            <Button
              onClick={() => {
                resetState();
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-slate-100">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drag and drop file here, or{' '}
                  <span className="text-emerald-400 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Images, Videos, Audio, Documents, and Archives
                </p>
              </div>
            )}
          </div>

          {/* Visibility Selection */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <span className="text-sm font-medium text-slate-200 block">File Access Rules</span>
              <span className="text-xs text-slate-400">
                Choose who can access this stored file
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  visibility === 'PRIVATE'
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Private
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  visibility === 'PUBLIC'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Public
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <ProgressBar
                value={uploadProgress}
                label="Transferring to Decentralized Storage Network..."
                sublabel={uploadSpeed}
                color="emerald"
              />
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
            >
              Upload to Network
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
