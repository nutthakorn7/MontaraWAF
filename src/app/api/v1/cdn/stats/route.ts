// CDN API Routes
// Endpoints for managing CDN settings from Dashboard

import { NextRequest, NextResponse } from 'next/server';
import {
    CDNAdapter,
    NullCDNAdapter,
} from '@/waf-engine/aggregator/adapters/cdn-interface';
import { CloudflareCDNAdapter } from '@/waf-engine/aggregator/adapters/cloudflare';

function getCDNAdapter(): CDNAdapter {
    const provider = process.env.CDN_PROVIDER || 'none';
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (provider === 'cloudflare' && apiToken && zoneId) {
        return new CloudflareCDNAdapter(apiToken, zoneId);
    }

    return new NullCDNAdapter();
}

// GET /api/v1/cdn/stats - Get traffic and cache stats
export async function GET(request: NextRequest) {
    try {
        const adapter = getCDNAdapter();
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('range') || '24h';
        const type = searchParams.get('type') || 'all';

        if (!adapter.enabled) {
            return NextResponse.json({
                enabled: false,
                message: 'CDN not configured',
            });
        }

        if (type === 'traffic') {
            const stats = await adapter.getTrafficStats(timeRange);
            return NextResponse.json({ enabled: true, traffic: stats });
        }

        if (type === 'cache') {
            const stats = await adapter.getCacheStats(timeRange);
            return NextResponse.json({ enabled: true, cache: stats });
        }

        // Default: return both
        const [traffic, cache] = await Promise.all([
            adapter.getTrafficStats(timeRange),
            adapter.getCacheStats(timeRange),
        ]);

        return NextResponse.json({
            enabled: true,
            provider: adapter.name,
            traffic,
            cache,
        });
    } catch (error) {
        console.error('CDN stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch CDN stats' },
            { status: 500 }
        );
    }
}
