import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo purposes
let policies = [
    {
        id: '1',
        name: 'SQL Injection Prevention',
        description: 'Blocks SQL injection attempts',
        type: 'waf',
        action: 'block',
        enabled: true,
        severity: 'critical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
    },
    {
        id: '2',
        name: 'XSS Prevention',
        description: 'Prevents cross-site scripting attacks',
        type: 'waf',
        action: 'block',
        enabled: true,
        severity: 'high',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-14T10:00:00Z',
    },
    {
        id: '3',
        name: 'Rate Limiting',
        description: 'Limits requests per IP',
        type: 'rate_limit',
        action: 'throttle',
        enabled: true,
        severity: 'medium',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-13T08:00:00Z',
    },
    {
        id: '4',
        name: 'Bot Detection',
        description: 'Identifies and blocks malicious bots',
        type: 'bot',
        action: 'challenge',
        enabled: true,
        severity: 'medium',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-12T15:00:00Z',
    },
    {
        id: '5',
        name: 'Geo Blocking - Russia',
        description: 'Blocks traffic from Russia',
        type: 'geo',
        action: 'block',
        enabled: false,
        severity: 'low',
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-11T09:00:00Z',
    },
];

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NextResponse.json(policies);
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const newPolicy = {
        id: String(Date.now()),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    policies.push(newPolicy);

    return NextResponse.json(newPolicy, { status: 201 });
}
