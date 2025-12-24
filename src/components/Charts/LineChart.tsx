'use client';

import React, { memo, useMemo } from 'react';

interface ChartDataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: ChartDataPoint[];
    title: string;
    color: string;
    height?: number;
}

// Memoized SVG Path Generator
const generatePath = (
    data: ChartDataPoint[],
    width: number,
    height: number,
    padding: number
): { linePath: string; areaPath: string } => {
    if (data.length === 0) return { linePath: '', areaPath: '' };

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const stepX = (width - padding * 2) / (data.length - 1 || 1);
    const chartHeight = height - padding * 2;

    const points = data.map((point, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - (point.value / maxValue) * chartHeight;
        return { x, y };
    });

    // Smooth curve using cubic bezier
    let linePath = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        linePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Area path for gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    return { linePath, areaPath };
};

// Memoized Data Point Component
const DataPoint = memo(function DataPoint({
    x,
    y,
    value,
    color,
    index
}: {
    x: number;
    y: number;
    value: number;
    color: string;
    index: number;
}) {
    return (
        <g>
            {/* Outer glow */}
            <circle
                cx={x}
                cy={y}
                r="8"
                fill={`${color}20`}
                style={{
                    animation: `pulse 2s ease-in-out infinite`,
                    animationDelay: `${index * 0.1}s`
                }}
            />
            {/* Inner dot */}
            <circle
                cx={x}
                cy={y}
                r="4"
                fill={color}
                style={{
                    filter: `drop-shadow(0 0 4px ${color})`
                }}
            />
        </g>
    );
});

const LineChart = memo(function LineChart({
    data,
    title,
    color,
    height = 180
}: LineChartProps) {
    const width = 280; // Fixed width, responsive via container
    const padding = 20;

    // Memoized calculations
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

    const { linePath, areaPath } = useMemo(
        () => generatePath(data, width, height, padding),
        [data, width, height]
    );

    const points = useMemo(() => {
        const stepX = (width - padding * 2) / (data.length - 1 || 1);
        const chartHeight = height - padding * 2;

        return data.map((point, index) => ({
            x: padding + index * stepX,
            y: padding + chartHeight - (point.value / maxValue) * chartHeight,
            value: point.value
        }));
    }, [data, width, height, maxValue]);

    const latestValue = data[data.length - 1]?.value ?? 0;
    const previousValue = data[data.length - 2]?.value ?? latestValue;
    const trend = latestValue - previousValue;
    const trendPercent = previousValue > 0
        ? ((trend / previousValue) * 100).toFixed(1)
        : '0';

    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.5rem',
                borderRadius: '16px'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
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
                        Haftalık trend
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }}
                >
                    <span
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                        }}
                    >
                        {latestValue}
                    </span>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: trend >= 0 ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                        }}
                    >
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(Number(trendPercent))}%
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div
                style={{
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    style={{
                        width: '100%',
                        height: 'auto',
                        // GPU acceleration
                        transform: 'translateZ(0)'
                    }}
                >
                    <defs>
                        {/* Gradient for area fill */}
                        <linearGradient
                            id={`areaGradient-${title.replace(/\s+/g, '-')}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id={`glow-${title.replace(/\s+/g, '-')}`}>
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill={`url(#areaGradient-${title.replace(/\s+/g, '-')})`}
                    />

                    {/* Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${title.replace(/\s+/g, '-')})`}
                        style={{
                            strokeDasharray: '1000',
                            strokeDashoffset: '1000',
                            animation: 'drawLine 1.5s ease forwards'
                        }}
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <DataPoint
                            key={index}
                            x={point.x}
                            y={point.y}
                            value={point.value}
                            color={color}
                            index={index}
                        />
                    ))}
                </svg>
            </div>

            {/* Labels */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    padding: '0 4px'
                }}
            >
                {data.map((point, index) => (
                    <span
                        key={index}
                        style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        {point.label}
                    </span>
                ))}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes drawLine {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
});

export default LineChart;
export type { ChartDataPoint, LineChartProps };
