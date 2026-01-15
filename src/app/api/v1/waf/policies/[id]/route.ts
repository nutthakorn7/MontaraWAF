// Policy CRUD API Routes - Individual Policy
// GET, PUT, DELETE for single policy

import { NextRequest, NextResponse } from 'next/server';
import {
    WAFPolicy,
    validatePolicy,
    policiesToCorazaConfig
} from '@/services/policy-service';
import * as fs from 'fs/promises';

// Shared policies store (in production, use database)
// This is a simplified version - share state via module or database
let policies: WAFPolicy[] = [];

const CORAZA_RULES_PATH = process.env.CORAZA_CUSTOM_RULES_PATH ||
    '/usr/local/apisix/conf/coraza/custom-policies.conf';

async function syncToCoraza(): Promise<void> {
    try {
        const config = policiesToCorazaConfig(policies);
        await fs.writeFile(CORAZA_RULES_PATH, config, 'utf-8');
    } catch (error) {
        console.error('Failed to sync policies to Coraza:', error);
    }
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/v1/waf/policies/[id] - Get single policy
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const policy = policies.find(p => p.id === id);

    if (!policy) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(policy);
}

// PUT /api/v1/waf/policies/[id] - Update policy
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const index = policies.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }

        const body = await request.json();
        const errors = validatePolicy(body);

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const updatedPolicy: WAFPolicy = {
            ...policies[index],
            name: body.name ?? policies[index].name,
            description: body.description ?? policies[index].description,
            enabled: body.enabled ?? policies[index].enabled,
            mode: body.mode ?? policies[index].mode,
            priority: body.priority ?? policies[index].priority,
            conditions: body.conditions ?? policies[index].conditions,
            actions: body.actions ?? policies[index].actions,
            updatedAt: new Date().toISOString(),
        };

        policies[index] = updatedPolicy;
        await syncToCoraza();

        return NextResponse.json(updatedPolicy);
    } catch (error) {
        console.error('Update policy error:', error);
        return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
    }
}

// DELETE /api/v1/waf/policies/[id] - Delete policy
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const index = policies.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    policies.splice(index, 1);
    await syncToCoraza();

    return NextResponse.json({ success: true, message: 'Policy deleted' });
}

// PATCH /api/v1/waf/policies/[id] - Toggle policy enabled/disabled
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const index = policies.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.enabled === 'boolean') {
        policies[index].enabled = body.enabled;
        policies[index].updatedAt = new Date().toISOString();
        await syncToCoraza();
    }

    return NextResponse.json(policies[index]);
}
