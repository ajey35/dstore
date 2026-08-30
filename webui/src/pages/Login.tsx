import { FormEvent, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNodeInfo } from '../hooks/useArchivistApi';
import '../styles/Login.css';

export function Login() {
    const { login, isLoading: authLoading } = useAuth();
    const { data: nodeInfo, isLoading: nodeLoading, error: nodeError } = useNodeInfo();
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signup' | 'signin'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleConnect = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        try {
            setError(null);
            if (mode === 'signup' && !name.trim()) {
                setError('Enter your name to create your storage profile.');
                return;
            }
            if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
                setError('Enter a valid email address.');
                return;
            }
            if (!nodeInfo?.id) {
                setError('Unable to connect to storage node. Please ensure the node is running.');
                return;
            }
            await login({ name: name.trim() || email.split('@')[0], email: email.trim() }, nodeInfo.id);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Connection failed: ${message}`);
        }
    }, [nodeInfo, login, mode, name, email]);

    return (
        <div className="login-shell">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">⌁</div>
                        <h1>Archivist</h1>
                        <p className="login-subtitle">Storage that stays yours</p>
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
                            <form onSubmit={handleConnect}>
                                <div className="auth-tabs" role="tablist" aria-label="Account action">
                                    <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
                                    <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button>
                                </div>
                                <p className="auth-intro">{mode === 'signup' ? 'Set up your private storage profile in under a minute.' : 'Welcome back. Connect to your storage space.'}</p>
                                {mode === 'signup' && <label className="field-label">Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name" /></label>}
                                <label className="field-label">Email address<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></label>
                                {error && (
                                    <div className="login-error-box">
                                        <p>{error}</p>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="login-button primary"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Connecting your space...' : mode === 'signup' ? 'Create my storage space' : 'Open my storage space'}
                                </button>
                                <div className="connected-node"><span className="online-dot" /> Network ready · node {nodeInfo?.id?.slice(0, 12)}…</div>
                            </form>
                        )}
                    </div>

                    <div className="login-footer">
                        <p>Your profile is saved in this browser. File storage, transfers and availability are powered by the connected Archivist node.</p>
                    </div>
                </div>

                <div className="login-background-animation" />
            </div>
        </div>
    );
}
