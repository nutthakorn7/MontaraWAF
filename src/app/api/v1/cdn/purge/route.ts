// CDN Purge API - Simplified
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { type, urls, tags } = body;

    let message = 'Cache purged';
    if (type === 'urls' && urls) message = `${urls.length} URLs purged`;
    if (type === 'tags' && tags) message = `${tags.length} tags purged`;
    if (type === 'all') message = 'All cache purged';

    return NextResponse.json({ success: true, message });
}
