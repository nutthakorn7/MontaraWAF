// CDN Stats API - Simplified
import { NextResponse } from 'next/server';

export async function GET() {
    const stats = {
        enabled: true,
        provider: 'cloudflare',
        traffic: {
            requests: { total: 500000, cached: 400000, uncached: 100000 },
            bandwidth: { total: 50000000000, cached: 45000000000, uncached: 5000000000 },
        },
        cache: {
            hitRate: 80.0,
            bandwidth: { saved: 45000000000, served: 50000000000 },
        },
        updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(stats);
}
