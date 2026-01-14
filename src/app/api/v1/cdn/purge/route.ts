// CDN Cache Purge API Routes

import { NextRequest, NextResponse } from 'next/server';
import { CDNAdapter, NullCDNAdapter } from '@/waf-engine/aggregator/adapters/cdn-interface';
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

// POST /api/v1/cdn/purge - Purge cache
export async function POST(request: NextRequest) {
    try {
        const adapter = getCDNAdapter();

        if (!adapter.enabled) {
            return NextResponse.json(
                { error: 'CDN not configured' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { type, urls, tags } = body;

        switch (type) {
            case 'all':
                await adapter.purgeAll();
                return NextResponse.json({ success: true, message: 'All cache purged' });

            case 'urls':
                if (!urls || !Array.isArray(urls)) {
                    return NextResponse.json(
                        { error: 'URLs required for URL purge' },
                        { status: 400 }
                    );
                }
                await adapter.purgeUrls(urls);
                return NextResponse.json({
                    success: true,
                    message: `${urls.length} URLs purged`,
                });

            case 'tags':
                if (!tags || !Array.isArray(tags)) {
                    return NextResponse.json(
                        { error: 'Tags required for tag purge' },
                        { status: 400 }
                    );
                }
                await adapter.purgeTags(tags);
                return NextResponse.json({
                    success: true,
                    message: `${tags.length} tags purged`,
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid purge type. Use: all, urls, or tags' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Cache purge error:', error);
        return NextResponse.json(
            { error: 'Failed to purge cache' },
            { status: 500 }
        );
    }
}
