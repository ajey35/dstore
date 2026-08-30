'use client';

import React, { useState } from 'react';
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
  Copy,
  Check,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  cid: string;
  uploadStatus: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  category: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER';
  createdAt: string;
}

interface FileTableProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileTable: React.FC<FileTableProps> = ({
  files,
  onPreview,
  onDownload,
  onDelete,
}) => {
  const [copiedCid, setCopiedCid] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'AUDIO':
        return <Music className="w-4 h-4 text-indigo-400" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'ARCHIVE':
        return <Archive className="w-4 h-4 text-rose-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCid(text);
    setTimeout(() => setCopiedCid(null), 2000);
  };

  if (files.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        <File className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-slate-300">No files found</h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload files or adjust your search filters to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Size</th>
              <th className="py-3.5 px-4">Network CID</th>
              <th className="py-3.5 px-4">Visibility</th>
              <th className="py-3.5 px-4">Uploaded</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {files.map((file) => (
              <tr
                key={file.id}
                className="hover:bg-slate-800/40 transition-colors group text-slate-200"
              >
                {/* File Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-100 group-hover:text-emerald-400 transition-colors block max-w-xs truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono block truncate max-w-[200px]">
                        {file.mimeType}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <Badge variant="slate" size="sm">
                    {file.category}
                  </Badge>
                </td>

                {/* Size */}
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                  {file.sizeFormatted}
                </td>

                {/* CID with 1-click Copy */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 w-fit">
                    <span className="truncate max-w-[120px]">{file.cid}</span>
                    <button
                      onClick={() => copyToClipboard(file.cid)}
                      title="Copy CID to clipboard"
                      className="text-slate-500 hover:text-slate-200 transition-colors p-0.5"
                    >
                      {copiedCid === file.cid ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Visibility */}
                <td className="py-3.5 px-4">
                  {file.visibility === 'PUBLIC' ? (
                    <Badge variant="emerald" size="sm" className="gap-1">
                      <Globe className="w-3 h-3" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm" className="gap-1">
                      <Lock className="w-3 h-3" /> Private
                    </Badge>
                  )}
                </td>

                {/* Uploaded Date */}
                <td className="py-3.5 px-4 text-xs text-slate-400">
                  {new Date(file.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(file.category) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPreview(file)}
                        title="Preview Media"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(file)}
                      title="Download File"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(file)}
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
