'use client';

import React, { useState, useEffect } from 'react';
import { DeviceService, Device } from '@/services/device.service';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DeviceStatusPage() {
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        const unsubscribe = DeviceService.subscribeToDevices(setDevices);
        return () => unsubscribe();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Cihaz Durumları</h1>
                <p style={{ color: 'var(--text-muted)' }}>Tüm cihazların teknik durumlarını ve güç tüketimlerini buradan izleyebilirsiniz.</p>
            </div>

            <div className="glass-panel" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cihaz Adı</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tip</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Durum</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sensör Verileri</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bağlantı</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Son Güncelleme</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device) => (
                            <tr key={device.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.2rem', fontWeight: 500 }}>{device.name}</td>
                                <td style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>{device.type}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: device.status === 'on' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        color: device.status === 'on' ? '#10b981' : 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {device.status === 'on' ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>
                                    {device.sensorData ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {device.sensorData.temperature !== undefined && (
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    🌡️ {device.sensorData.temperature}°C
                                                </span>
                                            )}
                                            {device.sensorData.humidity !== undefined && (
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    💧 %{device.sensorData.humidity}
                                                </span>
                                            )}
                                            {device.sensorData.gas !== undefined && (
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    💨 {device.sensorData.gas}
                                                </span>
                                            )}
                                            {device.sensorData.flame && (
                                                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    🔥 ALEV!
                                                </span>
                                            )}
                                            {!device.sensorData.temperature && !device.sensorData.humidity && !device.sensorData.gas && !device.sensorData.flame && (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: device.isOnline ? '#10b981' : '#ef4444'
                                        }} />
                                        <span style={{ color: device.isOnline ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                            {device.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {device.createdAt?.seconds
                                        ? formatDistanceToNow(new Date(device.createdAt.seconds * 1000), { addSuffix: true, locale: tr })
                                        : 'Bilinmiyor'}
                                </td>
                            </tr>
                        ))}
                        {devices.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Gösterilebilecek veri yok.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
