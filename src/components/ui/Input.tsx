import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.inputWrapper}>
                <input
                    className={`${styles.input} ${className || ''}`}
                    {...props}
                />
            </div>
        </div>
    );
}
