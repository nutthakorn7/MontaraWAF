// WAF Geo API - Simplified
import { NextRequest, NextResponse } from 'next/server';

let blockedCountries = [
    { id: '1', countryCode: 'CN', countryName: 'China', createdAt: new Date().toISOString() },
    { id: '2', countryCode: 'RU', countryName: 'Russia', createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json({ blocked: blockedCountries, total: blockedCountries.length });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newEntry = {
        id: `geo-${Date.now()}`,
        countryCode: body.countryCode,
        countryName: body.countryName || body.countryCode,
        createdAt: new Date().toISOString(),
    };
    blockedCountries.push(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const country = request.nextUrl.searchParams.get('country');
    if (country) blockedCountries = blockedCountries.filter(c => c.countryCode !== country);
    return NextResponse.json({ success: true });
}
