// Attack Stories API
import { NextResponse } from 'next/server';

export async function GET() {
    const stories = [
        {
            id: '1',
            title: 'SQL Injection Attack Mitigated',
            severity: 'critical',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            source: '192.168.1.100',
            country: 'CN',
            attackType: 'SQL Injection',
            rulesTriggered: ['942100', '942110', '942120'],
            requestsBlocked: 45,
            status: 'mitigated',
            summary: 'Multiple SQL injection attempts detected from single IP',
        },
        {
            id: '2',
            title: 'Brute Force Login Attempt',
            severity: 'high',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            source: '10.0.0.50',
            country: 'RU',
            attackType: 'Brute Force',
            rulesTriggered: ['920300'],
            requestsBlocked: 1500,
            status: 'mitigated',
            summary: 'Rapid login attempts blocked by rate limiting',
        },
        {
            id: '3',
            title: 'XSS Attack Detected',
            severity: 'high',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            source: '172.16.0.25',
            country: 'US',
            attackType: 'Cross-Site Scripting',
            rulesTriggered: ['941100', '941110'],
            requestsBlocked: 12,
            status: 'mitigated',
            summary: 'XSS payloads in query parameters blocked',
        },
    ];

    return NextResponse.json(stories);
}
