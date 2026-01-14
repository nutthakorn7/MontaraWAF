// WAF IPs API - Simplified
import { NextRequest, NextResponse } from 'next/server';

let ipList = [
    { id: '1', ip: '192.168.1.100', type: 'blacklist', reason: 'Known attacker', createdAt: new Date().toISOString() },
    { id: '2', ip: '10.0.0.0/8', type: 'whitelist', reason: 'Internal network', createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json({ entries: ipList, total: ipList.length });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newEntry = {
        id: `ip-${Date.now()}`,
        ip: body.ip,
        type: body.type || 'blacklist',
        reason: body.reason,
        createdAt: new Date().toISOString(),
    };
    ipList.push(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const ip = request.nextUrl.searchParams.get('ip');
    if (ip) ipList = ipList.filter(e => e.ip !== ip);
    return NextResponse.json({ success: true });
}
