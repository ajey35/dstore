'use client';

import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileItem } from './FileTable';

interface MediaPreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (file && file.category === 'DOCUMENT' && file.size < 1000000) {
      setIsLoadingText(true);
      fetch(`/api/files/${file.id}/preview`)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setIsLoadingText(false);
        })
        .catch(() => setIsLoadingText(false));
    } else {
      setTextContent(null);
    }
  }, [file]);

  if (!file) return null;

  const previewUrl = `/api/files/${file.id}/preview`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name} maxWidth="4xl">
      <div className="space-y-4">
        {/* Top bar info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              CID: {file.cid}
            </span>
            <span>{file.sizeFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => onDownload(file)}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Media Viewer Area */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden min-h-[300px] flex items-center justify-center p-4">
          {file.category === 'IMAGE' && (
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          )}

          {file.category === 'VIDEO' && (
            <video
              src={previewUrl}
              controls
              autoPlay
              className="max-h-[60vh] w-full rounded-lg shadow-lg"
            />
          )}

          {file.category === 'AUDIO' && (
            <div className="w-full max-w-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <Music className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-slate-100 mb-4">{file.name}</h4>
              <audio src={previewUrl} controls className="w-full" />
            </div>
          )}

          {file.category === 'DOCUMENT' && (
            <div className="w-full max-h-[60vh] overflow-y-auto">
              {isLoadingText ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Loading document stream...
                </div>
              ) : textContent ? (
                <pre className="text-xs font-mono text-slate-300 p-4 bg-slate-900 rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {textContent}
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm font-semibold">Document Preview</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Download file to view full application rendering.
                  </p>
                </div>
              )}
            </div>
          )}

          {['ARCHIVE', 'OTHER'].includes(file.category) && (
            <div className="py-12 text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ExternalLink className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No Inline Preview Available</p>
              <p className="text-xs text-slate-500 mt-1">
                Please download the file to inspect its contents.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
