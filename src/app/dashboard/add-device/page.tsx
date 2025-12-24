'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeviceService } from '@/services/device.service';

export default function AddDevicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('Sensor Hub');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const deviceTypes = [
        'Sensor Hub',
        'Light',
        'Thermostat',
        'Camera',
        'Lock',
        'Other'
    ];

    const sensorOptions = [
        { id: 'temperature', label: 'Sıcaklık' },
        { id: 'humidity', label: 'Nem' },
        { id: 'gas', label: 'Gaz' },
        { id: 'flame', label: 'Alev Tespit' }
    ];

    const handleSensorToggle = (sensorId: string) => {
        setSelectedSensors(prev =>
            prev.includes(sensorId)
                ? prev.filter(id => id !== sensorId)
                : [...prev, sensorId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        if (selectedSensors.length === 0) {
            setStatus({ type: 'error', message: 'Lütfen en az bir sensör seçiniz.' });
            setLoading(false);
            return;
        }

        if (!ownerEmail || !ownerPassword) {
            setStatus({ type: 'error', message: 'Lütfen kullanıcı bilgilerini doldurunuz.' });
            setLoading(false);
            return;
        }

        try {
            await DeviceService.addDevice({
                name,
                type,
                status: 'off',
                isOnline: true,
                powerUsage: Math.floor(Math.random() * 50) + 5, // Mock power usage
                sensors: selectedSensors,
                ownerEmail,
                ownerPassword
            });

            setStatus({ type: 'success', message: 'Cihaz ve sensörler başarıyla tanımlandı!' });
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: 'Hata: ' + (error.message || 'Cihaz eklenemedi') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Yeni Cihaz & Sensör Ekle</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Device Info */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Cihaz Adı
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Örn: Salon Kontrolcüsü"
                        required
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Cihaz Tipi
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(30,30,30,1)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem'
                        }}
                    >
                        {deviceTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Sensor Selection */}
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        Sensörleri Seçiniz
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {sensorOptions.map(sensor => (
                            <label key={sensor.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedSensors.includes(sensor.id)}
                                    onChange={() => handleSensorToggle(sensor.id)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color, #2563eb)' }}
                                />
                                <span style={{ color: 'var(--text-secondary)' }}>{sensor.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Owner Credentials */}
                <div style={{ padding: '1.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        Kullanıcı (Sahip) Bilgileri
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Kullanıcı Email
                            </label>
                            <input
                                type="email"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                placeholder="user@gmail.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Kullanıcı Şifre
                            </label>
                            <input
                                type="text"
                                value={ownerPassword}
                                onChange={(e) => setOwnerPassword(e.target.value)}
                                placeholder="Şifre belirleyin"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            * Bu bilgiler mobil uygulamadan sensör takibi için kullanılacaktır.
                        </p>
                    </div>
                </div>

                {status && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: status.type === 'success' ? '#10b981' : '#ef4444',
                        textAlign: 'center'
                    }}>
                        {status.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        background: 'var(--primary-color, #2563eb)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'opacity 0.2s'
                    }}
                >
                    {loading ? 'Kaydediliyor...' : 'Cihazı Sistemi Kaydet'}
                </button>
            </form>
        </div>
    );
}
