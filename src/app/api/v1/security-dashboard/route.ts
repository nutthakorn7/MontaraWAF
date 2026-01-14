import { NextResponse } from 'next/server';

const mockSecurityDashboard = {
    distribution: {
        allRequests: '15,234,567',
        requestsBlocked: '45,678',
        wafSessions: '1,234',
        allChange: 12.5,
        blockedChange: -5.2,
        sessionsChange: 8.3,
    },
    violationTypes: [
        { name: 'SQL Injection', value: 35, color: '#ef4444' },
        { name: 'XSS', value: 28, color: '#f97316' },
        { name: 'Path Traversal', value: 18, color: '#eab308' },
        { name: 'Command Injection', value: 12, color: '#22c55e' },
        { name: 'Other', value: 7, color: '#3b82f6' },
    ],
    topAttackers: [
        { ip: '192.168.1.100', country: 'China', flag: '🇨🇳', attacks: 1234 },
        { ip: '10.0.0.50', country: 'Russia', flag: '🇷🇺', attacks: 987 },
        { ip: '172.16.0.25', country: 'USA', flag: '🇺🇸', attacks: 765 },
        { ip: '192.168.2.200', country: 'Brazil', flag: '🇧🇷', attacks: 543 },
        { ip: '10.1.1.100', country: 'India', flag: '🇮🇳', attacks: 321 },
    ],
    actionsBySource: [
        { name: 'Blocked', value: 65, color: '#ef4444' },
        { name: 'Challenged', value: 20, color: '#f97316' },
        { name: 'Logged', value: 15, color: '#3b82f6' },
    ],
    attackTimeSeries: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        attacks: Math.floor(Math.random() * 500) + 100,
        blocked: Math.floor(Math.random() * 450) + 90,
    })),
    triggeredPolicies: [
        { policy: 'SQL Injection Prevention', triggers: 2345, severity: 'critical' },
        { policy: 'XSS Prevention', triggers: 1890, severity: 'high' },
        { policy: 'Rate Limiting', triggers: 1234, severity: 'medium' },
        { policy: 'Bot Detection', triggers: 987, severity: 'low' },
    ],
    securitySettings: [
        { type: 'WAF Mode', sessions: 1234, currentSetting: 'Block' },
        { type: 'Sensitivity', sessions: 567, currentSetting: 'High' },
        { type: 'Rate Limit', sessions: 890, currentSetting: '100 req/min' },
    ],
};

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NextResponse.json(mockSecurityDashboard);
}
