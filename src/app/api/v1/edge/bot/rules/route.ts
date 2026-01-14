// Bot Rules API - List and manage bot rules
import { NextRequest, NextResponse } from 'next/server';
import { botProtection } from '@/services/bot-protection';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    let rules = botProtection.getRules();

    // Filter by category
    if (category) {
        rules = rules.filter(r => r.category === category);
    }

    // Filter by type
    if (type) {
        rules = rules.filter(r => r.type === type);
    }

    return NextResponse.json({
        rules,
        total: rules.length,
        categories: ['crawler', 'scraper', 'attack_tool', 'automation', 'good_bot'],
        types: ['block', 'allow', 'challenge'],
    });
}
