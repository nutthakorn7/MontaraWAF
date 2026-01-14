// API Routes for CrowdSec Decisions
// Manage IP bans, captchas, and throttling from Dashboard

import { NextRequest, NextResponse } from 'next/server';
import { CrowdSecAdapter } from '@/waf-engine/aggregator/adapters/crowdsec';

function getCrowdSecAdapter(): CrowdSecAdapter {
    return new CrowdSecAdapter(
        process.env.CROWDSEC_API_URL || 'http://localhost:8080',
        process.env.CROWDSEC_BOUNCER_KEY || ''
    );
}

// GET /api/v1/waf/decisions - Get all active decisions
export async function GET() {
    try {
        const adapter = getCrowdSecAdapter();
        const decisions = await adapter.getDecisions();
        return NextResponse.json(decisions);
    } catch (error) {
        console.error('CrowdSec error:', error);
        return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
    }
}

// POST /api/v1/waf/decisions - Add a new decision (ban/captcha/throttle)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ip, type = 'ban', duration = '4h' } = body;

        if (!ip) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }

        const adapter = getCrowdSecAdapter();
        await adapter.addDecision(ip, type, duration);

        return NextResponse.json({ success: true, message: `${type} added for ${ip}` });
    } catch (error) {
        console.error('CrowdSec error:', error);
        return NextResponse.json({ error: 'Failed to add decision' }, { status: 500 });
    }
}

// DELETE /api/v1/waf/decisions?ip=x.x.x.x - Remove a decision
export async function DELETE(request: NextRequest) {
    try {
        const ip = request.nextUrl.searchParams.get('ip');

        if (!ip) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }

        const adapter = getCrowdSecAdapter();
        await adapter.removeDecision(ip);

        return NextResponse.json({ success: true, message: `Decision removed for ${ip}` });
    } catch (error) {
        console.error('CrowdSec error:', error);
        return NextResponse.json({ error: 'Failed to remove decision' }, { status: 500 });
    }
}
