// IP Rules API
import { NextRequest, NextResponse } from 'next/server';

interface IPRule {
    id: string;
    ip: string;
    action: 'allow' | 'block' | 'challenge';
    note?: string;
    expiresAt?: string;
    createdAt: string;
}

let ipRules: IPRule[] = [
    { id: '1', ip: '192.168.1.100', action: 'block', note: 'Known attacker', createdAt: new Date().toISOString() },
    { id: '2', ip: '10.0.0.0/8', action: 'allow', note: 'Internal network', createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json(ipRules);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newRule: IPRule = {
        id: `ip-${Date.now()}`,
        ip: body.ip,
        action: body.action || 'block',
        note: body.note,
        expiresAt: body.expiresAt,
        createdAt: new Date().toISOString(),
    };
    ipRules.push(newRule);
    return NextResponse.json(newRule, { status: 201 });
}
