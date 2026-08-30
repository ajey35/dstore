import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpload } from '../hooks/useUpload';
import { useStorageFiles, useSpaceInfo, usePeers } from '../hooks/useArchivistApi';
import { apiClient } from '../lib/api';
import type { StorageFile } from '../lib/types';
import '../styles/Dashboard.css';

export function Dashboard() {
    const { user, logout } = useAuth();
    const { activeUploads, addUpload, cancelUpload, clearCompleted } = useUpload();
    const { data: files, isLoading: filesLoading, refetch: refetchFiles } = useStorageFiles();
    const { data: space, isLoading: spaceLoading } = useSpaceInfo();
    const { data: peers } = usePeers();
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedFile, setExpandedFile] = useState<string | null>(null);

    // Refetch files when upload completes
    useEffect(() => {
        const hasCompleted = Array.from(activeUploads.values()).some(
            (u) => u.status === 'complete',
        );
        if (hasCompleted) {
            setTimeout(() => refetchFiles(), 1000);
        }
    }, [activeUploads, refetchFiles]);

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.files;
            if (!selected) return;

            Array.from(selected).forEach((file) => {
                addUpload(file);
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [addUpload],
    );

    const handleDownload = useCallback(async (file: StorageFile) => {
        try {
            const blob = await apiClient.downloadFile(file.cid);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Download failed: ${message}`);
        }
    }, []);

    const handleDelete = useCallback(
        async (file: StorageFile) => {
            if (!confirm(`Delete "${file.name}"?`)) return;

            try {
                await apiClient.deleteFile(file.cid);
                await refetchFiles();
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                setError(`Delete failed: ${message}`);
            }
        },
        [refetchFiles],
    );

    const usagePercent = space
        ? Math.round((space.quotaUsedBytes / space.quotaMaxBytes) * 100)
        : 0;

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="dashboard-shell">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard</h1>
                    <p className="header-subtitle">Manage your decentralized storage</p>
                </div>
                <div className="header-right">
                    <button
                        className="btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload Files
                    </button>
                    <button className="btn-ghost" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Overview Cards */}
                <section className="section-row">
                    <div className="card stat-card">
                        <div className="card-header">
                            <h3>Storage Usage</h3>
                        </div>
                        <div className="storage-ring">
                            <div className="ring" style={{ borderColor: `hsl(${usagePercent}, 70%, 50%)` }}>
                                <span className="ring-value">{usagePercent}%</span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span>
                                {formatBytes(space?.quotaUsedBytes || 0)}
                                {' '}
                                /
                                {' '}
                                {formatBytes(space?.quotaMaxBytes || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="card-header">
                            <h3>Files</h3>
                        </div>
                        <div className="big-number">{files?.length || 0}</div>
                        <div className="card-footer">
                            <span>{formatBytes(files?.reduce((s, f) => s + f.size, 0) || 0)} stored</span>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="card-header">
                            <h3>Peers Connected</h3>
                        </div>
                        <div className="big-number">{peers?.length || 0}</div>
                        <div className="card-footer">
                            <span>Network nodes</span>
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="card-header">
                            <h3>Peer ID</h3>
                        </div>
                        <div className="peer-id">{user?.peerId?.substring(0, 16)}...</div>
                        <div className="card-footer">
                            <span>Your node identifier</span>
                        </div>
                    </div>
                </section>

                {/* Upload Progress */}
                {activeUploads.size > 0 && (
                    <section className="card uploads-card">
                        <div className="card-header">
                            <h3>Active Uploads ({activeUploads.size})</h3>
                            <button className="btn-small btn-ghost" onClick={clearCompleted}>
                                Clear
                            </button>
                        </div>
                        <div className="uploads-list">
                            {Array.from(activeUploads.values()).map((upload) => (
                                <div key={upload.fileId} className="upload-item">
                                    <div className="upload-info">
                                        <p className="upload-name">{upload.fileName}</p>
                                        <div className="upload-details">
                                            <span>{upload.progress.toFixed(0)}%</span>
                                            <span>•</span>
                                            <span>{formatBytes(upload.speed)}/s</span>
                                            {upload.eta > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{Math.ceil(upload.eta / 60)}m</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${upload.status}`}
                                            style={{ width: `${upload.progress}%` }}
                                        />
                                    </div>
                                    {upload.status === 'error' && (
                                        <p className="upload-error">{upload.error}</p>
                                    )}
                                    {upload.status === 'uploading' && (
                                        <button
                                            className="btn-small btn-ghost"
                                            onClick={() => cancelUpload(upload.fileId)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Errors */}
                {error && (
                    <div className="alert alert-error">
                        <p>{error}</p>
                        <button className="btn-small btn-ghost" onClick={() => setError(null)}>
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Files List */}
                <section className="card files-card">
                    <div className="card-header">
                        <h3>Your Files {filesLoading && <span className="loading-indicator">…</span>}</h3>
                    </div>

                    {files && files.length > 0 ? (
                        <div className="files-list">
                            {files.map((file) => (
                                <div
                                    key={file.cid}
                                    className={`file-item ${expandedFile === file.cid ? 'expanded' : ''}`}
                                >
                                    <div
                                        className="file-header"
                                        onClick={() =>
                                            setExpandedFile(
                                                expandedFile === file.cid ? null : file.cid,
                                            )
                                        }
                                    >
                                        <div className="file-info">
                                            <div className="file-name">{file.name}</div>
                                            <div className="file-meta">
                                                <span>{formatBytes(file.size)}</span>
                                                <span>•</span>
                                                <span className="status-badge">{file.status}</span>
                                                <span>•</span>
                                                <span>{file.replicas}x replicas</span>
                                            </div>
                                        </div>
                                        <div className="file-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(file);
                                                }}
                                            >
                                                ⬇️
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(file);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {expandedFile === file.cid && (
                                        <div className="file-details">
                                            <div className="detail-row">
                                                <span className="detail-label">CID</span>
                                                <code className="detail-value">{file.cid}</code>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Type</span>
                                                <span className="detail-value">{file.mimeType}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Protected</span>
                                                <span className="detail-value">
                                                    {file.protected ? '✓ Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No files yet</p>
                            <button
                                className="btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload your first file
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
}
