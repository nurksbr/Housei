'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Zap, Wifi, Smartphone } from 'lucide-react';
import { DeviceChart, LineChart } from '@/components/Charts';
import { DeviceService, Device } from '@/services/device.service';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DashboardPage() {
    const { user } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = DeviceService.subscribeToDevices((updatedDevices) => {
            setDevices(updatedDevices);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const activeCount = devices.filter(d => d.status === 'on').length;
        const totalPower = devices.reduce((sum, d) => sum + (d.status === 'on' ? (d.powerUsage || 0) : 0), 0);
        const onlineCount = devices.filter(d => d.isOnline).length;
        const onlinePercentage = devices.length > 0 ? Math.round((onlineCount / devices.length) * 100) : 0;

        return {
            activeCount,
            totalPower,
            onlineCount,
            onlinePercentage
        };
    }, [devices]);

    // Mock chart data based on real counts (since we don't have historical data yet)
    const chartData = useMemo(() => {
        const offset = devices.length;
        return {
            totalDevices: [
                { label: 'Pzt', value: Math.max(0, offset - 5) },
                { label: 'Sal', value: Math.max(0, offset - 4) },
                { label: 'Çar', value: Math.max(0, offset - 3) },
                { label: 'Per', value: Math.max(0, offset - 2) },
                { label: 'Cum', value: Math.max(0, offset - 1) },
                { label: 'Cmt', value: offset },
                { label: 'Paz', value: offset }
            ],
            activeDevices: [
                { label: 'Pzt', value: Math.max(0, stats.activeCount - 2) },
                { label: 'Sal', value: Math.max(0, stats.activeCount - 1) },
                { label: 'Çar', value: Math.max(0, stats.activeCount - 3) },
                { label: 'Per', value: Math.max(0, stats.activeCount - 1) },
                { label: 'Cum', value: stats.activeCount },
                { label: 'Cmt', value: Math.max(0, stats.activeCount - 1) },
                { label: 'Paz', value: stats.activeCount }
            ]
        };
    }, [devices.length, stats.activeCount]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Hero Section */}
            <div
                className="glass-panel"
                style={{
                    padding: '2.5rem',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(var(--primary), 0.1), rgba(var(--secondary), 0.1))',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Hoşgeldin, {user?.email?.split('@')[0] || 'Admin'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>
                        Housei kontrol paneli üzerinden {devices.length} adet cihazı yönetiyorsunuz.
                    </p>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(var(--primary), 0.2) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                />
            </div>

            {/* Quick Actions / Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <ActionCard
                    title="Aktif Cihazlar"
                    value={stats.activeCount.toString()}
                    icon={Activity}
                    color="hsl(var(--primary))"
                    subtitle={`${devices.length} cihazdan ${stats.activeCount} tanesi açık`}
                />
                <ActionCard
                    title="Anlık Güç"
                    value={`${stats.totalPower} W`}
                    icon={Zap}
                    color="hsl(var(--accent))"
                    subtitle="Tahmini tüketim"
                />
                <ActionCard
                    title="Bağlantı Durumu"
                    value={`%${stats.onlinePercentage}`}
                    icon={Wifi}
                    color="hsl(var(--secondary))"
                    subtitle={`${stats.onlineCount} cihaz çevrimiçi`}
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <DeviceChart
                    data={chartData.totalDevices}
                    title="Cihaz Artışı (Son 7 Gün)"
                    color="hsl(var(--primary))"
                    height={180}
                />
                <LineChart
                    data={chartData.activeDevices}
                    title="Aktif Kullanım Trendi"
                    color="hsl(var(--secondary))"
                    height={160}
                />
            </div>

            {/* Recent Devices Section */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={20} color="hsl(var(--primary))" />
                    Son Eklenen Cihazlar
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
                    ) : devices.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Henüz cihaz eklenmemiş.</p>
                    ) : (
                        devices.slice(0, 5).map((device) => (
                            <div
                                key={device.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: device.isOnline ? '#10b981' : '#ef4444',
                                            boxShadow: device.isOnline ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{device.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{device.type}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: device.status === 'on' ? '#10b981' : 'var(--text-muted)',
                                        fontWeight: 600
                                    }}>
                                        {device.status === 'on' ? 'AÇIK' : 'KAPALI'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {device.createdAt?.seconds ? formatDistanceToNow(new Date(device.createdAt.seconds * 1000), { addSuffix: true, locale: tr }) : 'Yeni'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function ActionCard({ title, value, icon: Icon, color, subtitle }: any) {
    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.5rem',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'default'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                    style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        background: `rgba(from ${color} r g b / 0.15)`,
                        color: color
                    }}
                >
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>{value}</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{subtitle}</div>
            </div>
        </div>
    );
}
