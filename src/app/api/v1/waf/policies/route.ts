// WAF Policies API - Simplified
import { NextRequest, NextResponse } from 'next/server';

interface Policy {
    id: string;
    name: string;
    enabled: boolean;
    mode: 'block' | 'detect' | 'off';
    priority: number;
    createdAt: string;
}

let policies: Policy[] = [
    { id: '1', name: 'Block SQL Injection', enabled: true, mode: 'block', priority: 1, createdAt: new Date().toISOString() },
    { id: '2', name: 'Block XSS', enabled: true, mode: 'block', priority: 2, createdAt: new Date().toISOString() },
    { id: '3', name: 'Rate Limit API', enabled: true, mode: 'block', priority: 10, createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json({ policies, total: policies.length });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newPolicy: Policy = {
        id: `policy-${Date.now()}`,
        name: body.name || 'New Policy',
        enabled: body.enabled ?? true,
        mode: body.mode || 'detect',
        priority: body.priority || policies.length + 1,
        createdAt: new Date().toISOString(),
    };
    policies.push(newPolicy);
    return NextResponse.json(newPolicy, { status: 201 });
}
