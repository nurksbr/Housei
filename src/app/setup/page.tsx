'use client';

import React, { useState } from 'react';
import { AuthService } from '@/services/auth.service';

export default function SetupPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Initial credentials
    const email = "fevziyenur@housei.io";
    const password = "Housei2025!";

    const handleSetup = async () => {
        setLoading(true);
        setStatus('Oluşturuluyor...');

        try {
            await AuthService.createAdminUser(email, password);
            setStatus(`Başarılı! Admin kullanıcısı oluşturuldu.\nEmail: ${email}\nŞifre: ${password}`);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'permission-denied') {
                setStatus(`HATA: Yazma izni reddedildi.\n\nLütfen Firebase Console > Firestore Database > Rules sekmesinden kuralları 'allow read, write: if true;' olarak güncelleyin ve yayınlayın.`);
            } else {
                setStatus(`Hata: ${error.message || 'Bilinmeyen hata'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'sans-serif',
            padding: '2rem'
        }}>
            <h1 style={{ marginBottom: '2rem' }}>DB Setup</h1>

            <div style={{
                background: '#111',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #333',
                maxWidth: '400px',
                width: '100%'
            }}>
                <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                    Bu işlem <b>admin</b> koleksiyonuna aşağıdaki kullanıcıyı ekleyecektir:
                </p>
                <div style={{
                    background: '#222',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontFamily: 'monospace'
                }}>
                    <div>Email: {email}</div>
                    <div>Pass:  {password}</div>
                </div>

                <button
                    onClick={handleSetup}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: loading ? '#555' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'İşleniyor...' : 'Admin Oluştur'}
                </button>

                {status && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: status.includes('Hata') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: status.includes('Hata') ? '#ef4444' : '#10b981',
                        borderRadius: '6px',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
