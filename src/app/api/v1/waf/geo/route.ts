// Geo-blocking API Routes
// Block/unblock countries

import { NextRequest, NextResponse } from 'next/server';
import { IPManagementService } from '@/waf-engine/services/ip-management-service';

function getService(): IPManagementService {
    return new IPManagementService();
}

// GET /api/v1/waf/geo - Get blocked countries
// POST /api/v1/waf/geo - Block a country
// DELETE /api/v1/waf/geo?country=XX - Unblock a country
export async function GET() {
    try {
        const service = getService();
        const blockedCountries = await service.getBlockedCountries();

        return NextResponse.json({
            blocked: blockedCountries,
            total: blockedCountries.length,
        });
    } catch (error) {
        console.error('Geo list error:', error);
        return NextResponse.json({ error: 'Failed to fetch geo rules' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const service = getService();
        const body = await request.json();
        const { countryCode, reason } = body;

        if (!countryCode || countryCode.length !== 2) {
            return NextResponse.json(
                { error: 'Valid 2-letter country code required' },
                { status: 400 }
            );
        }

        await service.blockCountry(countryCode, reason);

        return NextResponse.json({
            success: true,
            message: `Country ${countryCode.toUpperCase()} blocked`,
        });
    } catch (error) {
        console.error('Block country error:', error);
        return NextResponse.json({ error: 'Failed to block country' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const service = getService();
        const countryCode = request.nextUrl.searchParams.get('country');

        if (!countryCode || countryCode.length !== 2) {
            return NextResponse.json(
                { error: 'Valid 2-letter country code required' },
                { status: 400 }
            );
        }

        await service.unblockCountry(countryCode);

        return NextResponse.json({
            success: true,
            message: `Country ${countryCode.toUpperCase()} unblocked`,
        });
    } catch (error) {
        console.error('Unblock country error:', error);
        return NextResponse.json({ error: 'Failed to unblock country' }, { status: 500 });
    }
}
