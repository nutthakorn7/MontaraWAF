// Bot Protection API - Real-time bot management
import { NextRequest, NextResponse } from 'next/server';
import { botProtection } from '@/services/bot-protection';

export async function GET() {
    const stats = botProtection.getStats();
    const rules = botProtection.getRules();

    // Calculate category stats
    const categoryStats = rules.reduce((acc, rule) => {
        if (!acc[rule.category]) {
            acc[rule.category] = { total: 0, enabled: 0, hits: 0 };
        }
        acc[rule.category].total++;
        if (rule.enabled) acc[rule.category].enabled++;
        acc[rule.category].hits += rule.hitCount;
        return acc;
    }, {} as Record<string, { total: number; enabled: number; hits: number }>);

    return NextResponse.json({
        status: 'active',

        stats: {
            totalBotRequests: stats.totalBotRequests,
            blockedBots: stats.blockedBots,
            challengedBots: stats.challengedBots,
            allowedGoodBots: stats.allowedGoodBots,
            blockRate: stats.totalBotRequests > 0
                ? Math.round((stats.blockedBots / stats.totalBotRequests) * 100)
                : 0,
        },

        categories: categoryStats,
        topBotTypes: stats.topBotTypes,
        recentBots: stats.recentBots.slice(0, 20),

        rules: {
            total: rules.length,
            enabled: rules.filter(r => r.enabled).length,
            blocked: rules.filter(r => r.type === 'block').length,
            allowed: rules.filter(r => r.type === 'allow').length,
        },

        protection: {
            jsChallenge: true,
            captchaEnabled: false,
            behaviorAnalysis: false,
            fingerprintEnabled: false,
        },

        updatedAt: new Date().toISOString(),
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Add new rule
    if (body.action === 'add' && body.rule) {
        const newRule = botProtection.addRule(body.rule);
        const synced = await botProtection.syncToAPISIX();
        return NextResponse.json({ success: true, rule: newRule, synced }, { status: 201 });
    }

    // Update existing rule
    if (body.action === 'update' && body.id && body.updates) {
        const updated = botProtection.updateRule(body.id, body.updates);
        if (!updated) {
            return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
        }
        const synced = await botProtection.syncToAPISIX();
        return NextResponse.json({ success: true, rule: updated, synced });
    }

    // Sync to APISIX
    if (body.action === 'sync') {
        const synced = await botProtection.syncToAPISIX();
        return NextResponse.json({ success: synced, message: synced ? 'Synced to APISIX' : 'Sync failed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    const deleted = botProtection.deleteRule(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const synced = await botProtection.syncToAPISIX();
    return NextResponse.json({ success: true, synced });
}
