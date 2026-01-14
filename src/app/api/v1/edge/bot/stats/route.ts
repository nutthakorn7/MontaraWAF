// Bot Stats API
import { NextResponse } from 'next/server';

export async function GET() {
    const botStats = {
        totalRequests: 1250000,
        botRequests: 125000,
        humanRequests: 1125000,
        botPercentage: 10.0,
        topBots: [
            { name: 'Googlebot', requests: 45000, status: 'allowed' },
            { name: 'Bingbot', requests: 25000, status: 'allowed' },
            { name: 'AhrefsBot', requests: 15000, status: 'blocked' },
            { name: 'SemrushBot', requests: 12000, status: 'blocked' },
            { name: 'Unknown', requests: 28000, status: 'challenged' },
        ],
        categories: {
            searchEngines: 70000,
            scrapers: 30000,
            monitoring: 5000,
            malicious: 15000,
            unknown: 5000,
        },
        trends: {
            daily: [
                { date: '2026-01-14', bots: 12500, humans: 112500 },
                { date: '2026-01-13', bots: 11800, humans: 118200 },
                { date: '2026-01-12', bots: 13200, humans: 106800 },
            ],
        },
    };

    return NextResponse.json(botStats);
}
