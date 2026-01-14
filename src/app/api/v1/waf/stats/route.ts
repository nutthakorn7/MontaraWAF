// API Routes for Aggregator Service
// These routes are used by the Dashboard to fetch unified security data

import { NextRequest, NextResponse } from 'next/server';
import { Aggregator, AggregatorConfig } from '@/waf-engine/aggregator';

// Initialize aggregator with environment variables
function getAggregator(): Aggregator {
    const config: AggregatorConfig = {
        cloudflare: process.env.CLOUDFLARE_API_TOKEN ? {
            enabled: true,
            apiToken: process.env.CLOUDFLARE_API_TOKEN,
            zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
        } : undefined,
        crowdsec: {
            enabled: true,
            apiUrl: process.env.CROWDSEC_API_URL || 'http://localhost:8080',
            apiKey: process.env.CROWDSEC_BOUNCER_KEY || '',
        },
        apisix: {
            enabled: true,
            adminUrl: process.env.APISIX_ADMIN_URL || 'http://localhost:9180',
            adminKey: process.env.APISIX_ADMIN_KEY || 'edd1c9f034335f136f87ad84b625c8f1',
        },
        coraza: {
            enabled: true,
            logPath: process.env.CORAZA_LOG_PATH || '/var/log/coraza/audit.log',
        },
    };

    return new Aggregator(config);
}

// GET /api/v1/waf/stats - Get unified security stats
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('range') || '24h';

        const aggregator = getAggregator();
        const stats = await aggregator.getStats(timeRange);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Aggregator error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
