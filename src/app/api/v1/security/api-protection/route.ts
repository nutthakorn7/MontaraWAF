// API Protection API - Endpoints, API Keys, and Stats
import { NextRequest, NextResponse } from 'next/server';
import { apiProtection } from '@/services/api-protection';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get discovered endpoints
    if (action === 'discover') {
        const discovered = apiProtection.discoverEndpoints();
        return NextResponse.json({ discovered, count: discovered.length });
    }

    // Get API keys
    if (action === 'keys') {
        const keys = apiProtection.getAPIKeys();
        return NextResponse.json({ keys, total: keys.length });
    }

    // Get endpoints
    if (action === 'endpoints') {
        const endpoints = apiProtection.getEndpoints();
        return NextResponse.json({ endpoints, total: endpoints.length });
    }

    // Default: return stats and overview
    const stats = apiProtection.getStats();
    const endpoints = apiProtection.getEndpoints();
    const keys = apiProtection.getAPIKeys();

    return NextResponse.json({
        status: 'active',
        stats,

        endpoints: {
            total: endpoints.length,
            protected: endpoints.filter(e => e.enabled).length,
            list: endpoints.slice(0, 10),
        },

        apiKeys: {
            total: keys.length,
            active: keys.filter(k => k.enabled).length,
        },

        features: {
            rateLimiting: true,
            apiDiscovery: true,
            schemaValidation: true,
            apiKeyAuth: true,
        },

        updatedAt: new Date().toISOString(),
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Add endpoint
    if (body.action === 'add_endpoint') {
        apiProtection.addEndpoint({
            path: body.path,
            method: body.method || 'GET',
            rateLimit: body.rateLimit || 100,
            burstSize: body.burstSize || 200,
            requiresAuth: body.requiresAuth || false,
            schema: body.schema,
            enabled: body.enabled ?? true,
            hitCount: 0,
        });
        return NextResponse.json({ success: true, message: 'Endpoint added' });
    }

    // Create API key
    if (body.action === 'create_key') {
        const key = apiProtection.createAPIKey(
            body.name || 'New API Key',
            body.scopes || ['read'],
            body.rateLimit || 100
        );
        return NextResponse.json({
            success: true,
            key: key.key, // Return full key only on creation
            id: key.id,
        });
    }

    // Check rate limit (for middleware use)
    if (body.action === 'check') {
        const result = apiProtection.checkRateLimit(
            body.method,
            body.path,
            body.ip,
            body.apiKey
        );
        return NextResponse.json(result);
    }

    // Validate schema
    if (body.action === 'validate') {
        const result = apiProtection.validateSchema(
            body.method,
            body.path,
            body.body
        );
        return NextResponse.json(result);
    }

    // Validate API key
    if (body.action === 'validate_key') {
        const result = apiProtection.validateAPIKey(body.key, body.scope);
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (keyId) {
        const deleted = apiProtection.deleteAPIKey(keyId);
        return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ error: 'keyId required' }, { status: 400 });
}
