'use client';

import React, { memo, useMemo, useCallback } from 'react';

// Types
interface ChartDataPoint {
    label: string;
    value: number;
}

interface DeviceChartProps {
    data: ChartDataPoint[];
    title: string;
    color: string;
    height?: number;
}

// Memoized Bar Component - önce re-render'ları önler
const ChartBar = memo(function ChartBar({
    value,
    maxValue,
    color,
    label,
    index,
    height
}: {
    value: number;
    maxValue: number;
    color: string;
    label: string;
    index: number;
    height: number;
}) {
    const barHeight = useMemo(() => {
        return maxValue > 0 ? (value / maxValue) * (height - 40) : 0;
    }, [value, maxValue, height]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                minWidth: 0
            }}
        >
            <div
                style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    opacity: 0.9
                }}
            >
                {value}
            </div>
            <div
                style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${height - 40}px`,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${barHeight}px`,
                        background: `linear-gradient(180deg, ${color}, ${color}88)`,
                        borderRadius: '8px',
                        transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 20px ${color}33`,
                        // GPU acceleration için transform kullanımı
                        transform: 'translateZ(0)',
                        willChange: 'height'
                    }}
                />
            </div>
            <div
                style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                }}
            >
                {label}
            </div>
        </div>
    );
});

// Main Chart Component with memo
const DeviceChart = memo(function DeviceChart({
    data,
    title,
    color,
    height = 200
}: DeviceChartProps) {
    // Memoized max value calculation - sadece data değiştiğinde yeniden hesapla
    const maxValue = useMemo(() => {
        return Math.max(...data.map(d => d.value), 1);
    }, [data]);

    // Memoized total calculation
    const total = useMemo(() => {
        return data.reduce((sum, d) => sum + d.value, 0);
    }, [data]);

    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.5rem',
                borderRadius: '16px',
                height: 'fit-content'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}
            >
                <div>
                    <h3
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                        }}
                    >
                        {title}
                    </h3>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        Son 7 gün
                    </p>
                </div>
                <div
                    style={{
                        background: `${color}15`,
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: color
                        }}
                    >
                        {total}
                    </span>
                    <span
                        style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        toplam
                    </span>
                </div>
            </div>

            {/* Chart Area */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    height: `${height}px`,
                    padding: '0 4px'
                }}
            >
                {data.map((point, index) => (
                    <ChartBar
                        key={point.label}
                        value={point.value}
                        maxValue={maxValue}
                        color={color}
                        label={point.label}
                        index={index}
                        height={height}
                    />
                ))}
            </div>
        </div>
    );
});

export default DeviceChart;

// Export types for external usage
export type { ChartDataPoint, DeviceChartProps };
