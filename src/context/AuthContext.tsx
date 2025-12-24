'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, AdminUser } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load session from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('housei_admin_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('housei_admin_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const admin = await AuthService.verifyAdminCredentials(email, password);

            if (!admin) {
                throw new Error('Invalid email or password');
            }

            // Create session
            setUser(admin);
            localStorage.setItem('housei_admin_user', JSON.stringify(admin));
            router.push('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('housei_admin_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
