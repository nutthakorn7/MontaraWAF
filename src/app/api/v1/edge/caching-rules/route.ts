// Caching Rules API
import { NextRequest, NextResponse } from 'next/server';

interface CachingRule {
    id: string;
    name: string;
    path: string;
    ttl: number;
    cacheLevel: 'bypass' | 'basic' | 'aggressive';
    enabled: boolean;
    createdAt: string;
}

let cachingRules: CachingRule[] = [
    { id: '1', name: 'Static Assets', path: '/static/*', ttl: 86400, cacheLevel: 'aggressive', enabled: true, createdAt: new Date().toISOString() },
    { id: '2', name: 'API Cache', path: '/api/public/*', ttl: 300, cacheLevel: 'basic', enabled: true, createdAt: new Date().toISOString() },
    { id: '3', name: 'Images', path: '/images/*', ttl: 604800, cacheLevel: 'aggressive', enabled: true, createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json(cachingRules);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newRule: CachingRule = {
        id: `rule-${Date.now()}`,
        name: body.name,
        path: body.path,
        ttl: body.ttl || 3600,
        cacheLevel: body.cacheLevel || 'basic',
        enabled: body.enabled ?? true,
        createdAt: new Date().toISOString(),
    };
    cachingRules.push(newRule);
    return NextResponse.json(newRule, { status: 201 });
}
