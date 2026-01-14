import { NextResponse } from 'next/server';

const mockDashboardData = {
    stats: [
        { label: 'Total Requests', value: '2.4M', change: 12.5, changeLabel: 'vs last week' },
        { label: 'Blocked Attacks', value: '45.2K', change: -8.3, changeLabel: 'vs last week' },
        { label: 'Active Rules', value: '156', change: 3, changeLabel: 'new rules' },
        { label: 'Sites Protected', value: '24', change: 2, changeLabel: 'new sites' },
    ],
    security: [
        {
            label: 'WAF Protection',
            value: '99.8%',
            change: 0.2,
            subMetrics: [
                { label: 'SQL Injection', value: '12,456', color: '#ef4444' },
                { label: 'XSS Attacks', value: '8,234', color: '#f97316' },
                { label: 'Path Traversal', value: '3,567', color: '#eab308' },
            ],
            links: ['View details', 'Configure rules'],
        },
    ],
    timeSeries: Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        wafEvents: Math.floor(Math.random() * 1000) + 500,
        botAttacks: Math.floor(Math.random() * 500) + 200,
        ddosAttacks: Math.floor(Math.random() * 100) + 50,
    })),
    topWebsites: [
        { website: 'api.example.com', events: 15234, change: 12.5 },
        { website: 'app.example.com', events: 12456, change: -5.2 },
        { website: 'www.example.com', events: 8901, change: 3.1 },
        { website: 'cdn.example.com', events: 6543, change: 18.9 },
        { website: 'auth.example.com', events: 4321, change: -2.7 },
    ],
};

export async function GET() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockDashboardData);
}
