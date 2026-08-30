'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  UploadCloud,
  Search,
  Grid,
  List,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FileTable, FileItem } from '@/components/files/FileTable';
import { FileGrid } from '@/components/files/FileGrid';
import { UploadModal } from '@/components/files/UploadModal';
import { MediaPreviewModal } from '@/components/files/MediaPreviewModal';
import { Button } from '@/components/ui/Button';

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (categoryFilter !== 'ALL') query.set('category', categoryFilter);

      const res = await fetch(`/api/files?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = (file: FileItem) => {
    const a = document.createElement('a');
    a.href = `/api/files/${file.id}/download`;
    a.download = file.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const res = await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFiles();
      } else {
        alert('Failed to delete file');
      }
    } catch {
      alert('Error deleting file');
    }
  };

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const categories = [
    { label: 'All Files', value: 'ALL' },
    { label: 'Images', value: 'IMAGE' },
    { label: 'Videos', value: 'VIDEO' },
    { label: 'Audio', value: 'AUDIO' },
    { label: 'Documents', value: 'DOCUMENT' },
    { label: 'Archives', value: 'ARCHIVE' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Storage Browser</h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse, search, preview, and download content stored on the network
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchFiles}
            >
              Refresh
            </Button>
            <Button
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload File
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search file name, CID, or format..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  categoryFilter === cat.value
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Table / Grid View Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Content Area */}
        {viewMode === 'table' ? (
          <FileTable
            files={files}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        ) : (
          <FileGrid
            files={files}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}

        {/* Modals */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={fetchFiles}
        />

        <MediaPreviewModal
          file={previewFile}
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewFile(null);
          }}
          onDownload={handleDownload}
        />
      </div>
    </AppLayout>
  );
}
