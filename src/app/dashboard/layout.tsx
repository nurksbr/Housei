'use client';

import React, { useEffect } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    Sliders,
    Activity,
    LogOut,
} from 'lucide-react';

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Ana Sayfa', href: '/dashboard' },
    { icon: PlusCircle, label: 'Yeni Cihaz Ekle', href: '/dashboard/add-device' },
    { icon: Sliders, label: 'Kontrol', href: '/dashboard/control' },
    { icon: Activity, label: 'Cihaz Durumları', href: '/dashboard/device-status' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                Loading Panel...
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <div className={`${styles.logo} text-gradient`}>Housei</div>
                </Link>

                <nav className={styles.nav}>
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={logout}
                        className={styles.navItem}
                        style={{ color: 'hsl(var(--accent))', width: '100%', justifyContent: 'flex-start' }}
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className={styles.mainWrapper}>
                <header className={styles.header}>
                    <h2 className={styles.pageTitle}>Overview</h2>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {user.email[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {user.email}
                        </span>
                    </div>
                </header>

                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
