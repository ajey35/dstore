import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { User, AuthSession } from '../lib/types';

interface AuthContextType {
    user: User | null;
    session: AuthSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (peerId: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('archivist_auth');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.session && data.session.expiresAt > Date.now()) {
                    setSession(data.session);
                    setUser(data.user);
                } else {
                    localStorage.removeItem('archivist_auth');
                }
            } catch {
                localStorage.removeItem('archivist_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (peerId: string) => {
        setIsLoading(true);
        try {
            // Generate session token
            const sessionToken = `${peerId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

            const newSession: AuthSession = {
                userId: peerId,
                peerId,
                sessionToken,
                expiresAt,
            };

            const newUser: User = {
                id: peerId,
                peerId,
                createdAt: Date.now(),
                storageQuota: 2 * 1024 * 1024 * 1024, // 2TB default
                storageUsed: 0,
            };

            setSession(newSession);
            setUser(newUser);

            localStorage.setItem(
                'archivist_auth',
                JSON.stringify({
                    session: newSession,
                    user: newUser,
                }),
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setSession(null);
        setUser(null);
        localStorage.removeItem('archivist_auth');
    }, []);

    const updateUser = useCallback((newUser: User) => {
        setUser(newUser);
        if (session) {
            localStorage.setItem(
                'archivist_auth',
                JSON.stringify({
                    session,
                    user: newUser,
                }),
            );
        }
    }, [session]);

    const value: AuthContextType = {
        user,
        session,
        isLoading,
        isAuthenticated: !!session && !!user,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
