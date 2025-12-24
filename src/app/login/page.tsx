'use client';

import React, { useState } from 'react';
import styles from './login.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Get form data
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            router.push('/dashboard'); // Redirect on successful login
        } catch (err: any) {
            setError('Authentication failed. Check your credentials.');
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.header}>
                    <h1 className={`${styles.logo} text-gradient`}>Housei</h1>
                    <p className={styles.subtitle}>
                        Welcome back. Please access the admin panel securely.
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}
                    <Input
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="admin@housei.io"
                        required
                        autoComplete="email"
                    />
                    <Input
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? 'Verifying Credentials...' : 'Sign In To Dashboard'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
