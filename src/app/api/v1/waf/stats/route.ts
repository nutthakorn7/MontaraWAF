// WAF Stats API - Simplified
import { NextResponse } from 'next/server';

export async function GET() {
    const stats = {
        traffic: {
            totalRequests: 1250000,
            blockedRequests: 45000,
            allowedRequests: 1205000,
            blockedPercentage: 3.6,
        },
        threats: {
            sqlInjection: 12500,
            xss: 8500,
            rce: 2500,
            lfi: 5000,
            rfi: 1500,
            scanner: 15000,
        },
        topAttackers: [
            { ip: '192.168.1.100', requests: 5000, country: 'CN' },
            { ip: '10.0.0.50', requests: 3500, country: 'RU' },
            { ip: '172.16.0.25', requests: 2500, country: 'US' },
        ],
        performance: {
            avgLatency: 12.5,
            p95Latency: 45.2,
            p99Latency: 120.5,
        },
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats);
}
