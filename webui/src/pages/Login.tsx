import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNodeInfo } from '../hooks/useArchivistApi';
import '../styles/Login.css';

export function Login() {
    const { login, isLoading: authLoading } = useAuth();
    const { data: nodeInfo, isLoading: nodeLoading, error: nodeError } = useNodeInfo();
    const [error, setError] = useState<string | null>(null);

    const handleConnect = useCallback(async () => {
        try {
            setError(null);
            if (!nodeInfo?.id) {
                setError('Unable to connect to storage node. Please ensure the node is running.');
                return;
            }
            await login(nodeInfo.id);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Connection failed: ${message}`);
        }
    }, [nodeInfo, login]);

    return (
        <div className="login-shell">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">A</div>
                        <h1>Archivist</h1>
                        <p className="login-subtitle">Decentralized Storage Network</p>
                    </div>

                    <div className="login-content">
                        {nodeLoading ? (
                            <div className="login-loading">
                                <div className="spinner" />
                                <p>Connecting to storage node...</p>
                            </div>
                        ) : nodeError ? (
                            <div className="login-error-box">
                                <h3>⚠️ Connection Error</h3>
                                <p className="error-message">{nodeError.message}</p>
                                <p className="error-hint">
                                    Make sure the Archivist node is running on
                                    {' '}
                                    <code>localhost:8080</code>
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="login-node-info">
                                    <h3>Node Information</h3>
                                    <div className="info-item">
                                        <span className="info-label">Peer ID</span>
                                        <code className="info-value">{nodeInfo?.id ? nodeInfo.id.substring(0, 20) : '...'}...</code>
                                    </div>
                                    {nodeInfo?.archivist && (
                                        <div className="info-item">
                                            <span className="info-label">Version</span>
                                            <span className="info-value">{nodeInfo.archivist.version}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <span className="info-label">Addresses</span>
                                        <div className="info-addresses">
                                            {(nodeInfo?.addrs || []).slice(0, 2).map((addr) => (
                                                <code key={addr} className="info-addr">{addr}</code>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="login-error-box">
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    className="login-button primary"
                                    onClick={handleConnect}
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Connecting...' : 'Connect to Network'}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="login-footer">
                        <p>
                            Your data is encrypted and stored across a global network of independent nodes.
                        </p>
                    </div>
                </div>

                <div className="login-background-animation" />
            </div>
        </div>
    );
}
