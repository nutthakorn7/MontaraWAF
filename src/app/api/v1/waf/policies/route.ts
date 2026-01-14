// WAF Policies API - With APISIX Sync
import { NextRequest, NextResponse } from 'next/server';
import { apisixSync } from '@/services/apisix-sync';

interface Policy {
    id: string;
    name: string;
    enabled: boolean;
    mode: 'block' | 'detect' | 'off';
    priority: number;
    conditions: PolicyCondition[];
    action: 'block' | 'allow' | 'challenge' | 'log';
    createdAt: string;
}

interface PolicyCondition {
    field: 'uri' | 'args' | 'headers' | 'body' | 'method' | 'ip' | 'user-agent';
    operator: 'contains' | 'equals' | 'regex' | 'not_contains';
    value: string;
}

// In-memory store (in production, use database)
let policies: Policy[] = [
    {
        id: '1',
        name: 'Block SQL Injection',
        enabled: true,
        mode: 'block',
        priority: 1,
        conditions: [{ field: 'args', operator: 'regex', value: 'union.*select|1=1' }],
        action: 'block',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Block XSS',
        enabled: true,
        mode: 'block',
        priority: 2,
        conditions: [{ field: 'args', operator: 'contains', value: '<script' }],
        action: 'block',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Rate Limit API',
        enabled: true,
        mode: 'block',
        priority: 10,
        conditions: [],
        action: 'block',
        createdAt: new Date().toISOString()
    },
];

// Sync policies to APISIX
async function syncToAPISIX() {
    try {
        const success = await apisixSync.updateRouteWAF('1', policies as any);
        console.log('APISIX sync:', success ? 'success' : 'failed');
        return success;
    } catch (error) {
        console.error('APISIX sync error:', error);
        return false;
    }
}

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
        conditions: body.conditions || [],
        action: body.action || 'block',
        createdAt: new Date().toISOString(),
    };
    policies.push(newPolicy);

    // Sync to APISIX
    const synced = await syncToAPISIX();

    return NextResponse.json({
        ...newPolicy,
        synced
    }, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const index = policies.findIndex(p => p.id === body.id);

    if (index === -1) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    policies[index] = { ...policies[index], ...body };

    // Sync to APISIX
    const synced = await syncToAPISIX();

    return NextResponse.json({
        ...policies[index],
        synced
    });
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    policies = policies.filter(p => p.id !== id);

    // Sync to APISIX
    const synced = await syncToAPISIX();

    return NextResponse.json({ success: true, synced });
}
