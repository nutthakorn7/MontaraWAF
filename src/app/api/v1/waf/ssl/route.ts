// WAF SSL API - Simplified
import { NextRequest, NextResponse } from 'next/server';

const sslData = {
    certificates: [
        { id: '1', domain: '*.example.com', status: 'active', issuer: "Let's Encrypt", validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), autoRenew: true },
    ],
    settings: {
        minTLSVersion: '1.2',
        mode: 'full',
        hsts: { enabled: true, maxAge: 31536000 },
    },
};

export async function GET() {
    return NextResponse.json(sslData);
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    Object.assign(sslData.settings, body);
    return NextResponse.json(sslData.settings);
}
