// Policy CRUD API Routes
// Manages WAF policies from Dashboard

import { NextRequest, NextResponse } from 'next/server';
import {
    WAFPolicy,
    validatePolicy,
    policiesToCorazaConfig
} from '@/waf-engine/services/policy-service';
import * as fs from 'fs/promises';
import * as path from 'path';

// In-memory store (replace with database in production)
let policies: WAFPolicy[] = [
    {
        id: 'policy-1',
        name: 'Block SQL Injection',
        description: 'Block common SQL injection patterns',
        enabled: true,
        mode: 'block',
        priority: 1,
        conditions: [
            { field: 'uri', operator: 'matches', value: '(?i)(union|select|insert|update|delete|drop).*' }
        ],
        actions: [{ type: 'block', statusCode: 403, message: 'SQL Injection Detected' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'policy-2',
        name: 'Block XSS',
        description: 'Block cross-site scripting attacks',
        enabled: true,
        mode: 'block',
        priority: 2,
        conditions: [
            { field: 'uri', operator: 'matches', value: '(?i)(<script|javascript:|onerror=|onload=)' }
        ],
        actions: [{ type: 'block', statusCode: 403, message: 'XSS Detected' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'policy-3',
        name: 'Rate Limit API',
        description: 'Rate limit API endpoints to 100 req/min',
        enabled: true,
        mode: 'block',
        priority: 10,
        conditions: [
            { field: 'uri', operator: 'starts_with', value: '/api/' }
        ],
        actions: [{ type: 'rate_limit', rateLimit: { requests: 100, period: '1m' } }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const CORAZA_RULES_PATH = process.env.CORAZA_CUSTOM_RULES_PATH ||
    '/usr/local/apisix/conf/coraza/custom-policies.conf';

// Sync policies to Coraza config file
async function syncToCoraza(): Promise<void> {
    try {
        const config = policiesToCorazaConfig(policies);
        await fs.writeFile(CORAZA_RULES_PATH, config, 'utf-8');
    } catch (error) {
        console.error('Failed to sync policies to Coraza:', error);
    }
}

// GET /api/v1/waf/policies - List all policies
// POST /api/v1/waf/policies - Create new policy
export async function GET() {
    return NextResponse.json({
        policies,
        total: policies.length,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const errors = validatePolicy(body);
        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const newPolicy: WAFPolicy = {
            id: `policy-${Date.now()}`,
            name: body.name,
            description: body.description,
            enabled: body.enabled ?? true,
            mode: body.mode || 'detect',
            priority: body.priority || policies.length + 1,
            conditions: body.conditions,
            actions: body.actions || [{ type: 'block' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: body.createdBy,
        };

        policies.push(newPolicy);
        await syncToCoraza();

        return NextResponse.json(newPolicy, { status: 201 });
    } catch (error) {
        console.error('Create policy error:', error);
        return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
    }
}
