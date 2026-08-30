'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import { FileItem } from './FileTable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FileGridProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  onPreview,
  onDownload,
  onDelete,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IMAGE':
        return <ImageIcon className="w-8 h-8 text-emerald-400" />;
      case 'VIDEO':
        return <Video className="w-8 h-8 text-cyan-400" />;
      case 'AUDIO':
        return <Music className="w-8 h-8 text-indigo-400" />;
      case 'DOCUMENT':
        return <FileText className="w-8 h-8 text-amber-400" />;
      case 'ARCHIVE':
        return <Archive className="w-8 h-8 text-rose-400" />;
      default:
        return <File className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {files.map((file) => (
        <Card key={file.id} className="flex flex-col justify-between group">
          {/* Card Header Preview Area */}
          <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center overflow-hidden mb-4">
            {file.category === 'IMAGE' ? (
              // Inline preview image thumbnail
              <img
                src={`/api/files/${file.id}/preview`}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                {getCategoryIcon(file.category)}
              </div>
            )}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-slate-300 border border-slate-800">
              {file.sizeFormatted}
            </span>
          </div>

          {/* Details */}
          <div>
            <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
              {file.name}
            </h4>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">CID: {file.cid}</p>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500">
              {new Date(file.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              {['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(file.category) && (
                <Button variant="ghost" size="sm" onClick={() => onPreview(file)} title="Preview">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onDownload(file)} title="Download">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(file)} title="Delete">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
