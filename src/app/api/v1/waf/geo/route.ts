// WAF Geo API - With CrowdSec Sync
import { NextRequest, NextResponse } from 'next/server';
import { crowdsecSync } from '@/services/crowdsec-sync';

interface GeoEntry {
    id: string;
    countryCode: string;
    countryName: string;
    createdAt: string;
}

let blockedCountries: GeoEntry[] = [
    { id: '1', countryCode: 'CN', countryName: 'China', createdAt: new Date().toISOString() },
    { id: '2', countryCode: 'RU', countryName: 'Russia', createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json({ blocked: blockedCountries, total: blockedCountries.length });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newEntry: GeoEntry = {
        id: `geo-${Date.now()}`,
        countryCode: body.countryCode?.toUpperCase(),
        countryName: body.countryName || body.countryCode,
        createdAt: new Date().toISOString(),
    };

    // Sync to CrowdSec
    const synced = await crowdsecSync.blockCountry(newEntry.countryCode, `geo_block_${newEntry.countryName}`);

    blockedCountries.push(newEntry);

    return NextResponse.json({ ...newEntry, synced }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const country = request.nextUrl.searchParams.get('country');
    const id = request.nextUrl.searchParams.get('id');

    if (!country && !id) {
        return NextResponse.json({ error: 'Country code or ID required' }, { status: 400 });
    }

    const targetCode = country || blockedCountries.find(c => c.id === id)?.countryCode;

    if (targetCode) {
        // Remove from CrowdSec
        const synced = await crowdsecSync.unblockCountry(targetCode);

        // Remove from local list
        blockedCountries = blockedCountries.filter(c => c.countryCode !== targetCode && c.id !== id);

        return NextResponse.json({ success: true, synced });
    }

    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
}
