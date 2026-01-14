import { NextResponse } from 'next/server';

const mockAttackAnalytics = {
    analytics: {
        events: '156,789',
        eventsChange: 12.5,
        incidents: 234,
        incidentsChange: -8.3,
        critical: 12,
        major: 45,
        minor: 177,
    },
    incidentsByOrigin: [
        { country: 'China', count: 4567 },
        { country: 'Russia', count: 3456 },
        { country: 'USA', count: 2345 },
        { country: 'Brazil', count: 1234 },
        { country: 'India', count: 987 },
        { country: 'Germany', count: 654 },
        { country: 'France', count: 432 },
        { country: 'UK', count: 321 },
    ],
    topViolations: [
        { name: 'SQL Injection', value: 35, color: '#ef4444' },
        { name: 'XSS', value: 25, color: '#f97316' },
        { name: 'Path Traversal', value: 20, color: '#eab308' },
        { name: 'Command Injection', value: 12, color: '#22c55e' },
        { name: 'Other', value: 8, color: '#3b82f6' },
    ],
    attackToolTypes: [
        { name: 'Automated Scanner', value: 45, color: '#ef4444' },
        { name: 'Manual Exploit', value: 25, color: '#f97316' },
        { name: 'Botnet', value: 18, color: '#eab308' },
        { name: 'Script Kiddie', value: 12, color: '#22c55e' },
    ],
    incidents: [
        {
            id: '1',
            severity: 'critical',
            title: 'SQL Injection Attack Detected',
            source: '192.168.1.100',
            action: 'Blocked',
            time: '2 minutes ago',
            status: 'resolved',
        },
        {
            id: '2',
            severity: 'high',
            title: 'Brute Force Login Attempt',
            source: '10.0.0.50',
            action: 'Rate Limited',
            time: '5 minutes ago',
            status: 'investigating',
        },
        {
            id: '3',
            severity: 'medium',
            title: 'Suspicious Bot Activity',
            source: '172.16.0.25',
            action: 'Challenged',
            time: '12 minutes ago',
            status: 'monitoring',
        },
        {
            id: '4',
            severity: 'low',
            title: 'Unusual Traffic Pattern',
            source: '192.168.2.200',
            action: 'Logged',
            time: '1 hour ago',
            status: 'closed',
        },
    ],
};

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NextResponse.json(mockAttackAnalytics);
}
