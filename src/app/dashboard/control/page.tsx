'use client';

import React, { useState, useEffect } from 'react';
import { DeviceService, Device } from '@/services/device.service';
import { Power, Trash2 } from 'lucide-react';

export default function ControlPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = DeviceService.subscribeToDevices((updatedDevices) => {
            setDevices(updatedDevices);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleDevice = async (device: Device) => {
        try {
            await DeviceService.toggleDeviceStatus(device.id!, device.status);
        } catch (error) {
            console.error("Failed to toggle device", error);
        }
    };

    const deleteDevice = async (id: string, name: string) => {
        if (confirm(`${name} cihazını silmek istediğinize emin misiniz?`)) {
            try {
                await DeviceService.deleteDevice(id);
            } catch (error) {
                console.error("Failed to delete device", error);
            }
        }
    };

    if (loading) return <div className="glass-panel" style={{ padding: '2rem' }}>Yükleniyor...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Cihaz Kontrolü</h1>
                <p style={{ color: 'var(--text-muted)' }}>Cihazlarınızı buradan açıp kapatabilir veya sistemden kaldırabilirsiniz.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {devices.map((device) => (
                    <div
                        key={device.id}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            border: device.status === 'on' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{device.name}</h3>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{device.type}</div>
                            </div>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: device.isOnline ? '#10b981' : '#ef4444',
                                boxShadow: device.isOnline ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                            }} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button
                                onClick={() => toggleDevice(device)}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: device.status === 'on' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: device.status === 'on' ? '#10b981' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 600
                                }}
                            >
                                <Power size={18} />
                                {device.status === 'on' ? 'AÇIK' : 'KAPALI'}
                            </button>

                            <button
                                onClick={() => deleteDevice(device.id!, device.name)}
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Cihazı Sil"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {devices.length === 0 && (
                    <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Henüz hiç cihaz eklenmemiş. "Cihaz Ekle" menüsünden yeni cihaz ekleyebilirsiniz.
                    </div>
                )}
            </div>
        </div>
    );
}
