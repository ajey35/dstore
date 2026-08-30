import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import './styles/index.css';
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));

function AppContent() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}>
            {isAuthenticated ? <Dashboard /> : <Login />}
        </Suspense>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
