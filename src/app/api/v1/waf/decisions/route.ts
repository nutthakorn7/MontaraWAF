// WAF Decisions API - Simplified
import { NextResponse } from 'next/server';

export async function GET() {
    const decisions = [
        { id: '1', ip: '192.168.1.100', type: 'ban', duration: '4h', scenario: 'http-bruteforce', createdAt: new Date().toISOString() },
        { id: '2', ip: '10.0.0.50', type: 'captcha', duration: '1h', scenario: 'bad-bot', createdAt: new Date().toISOString() },
    ];
    return NextResponse.json({ decisions, total: decisions.length });
}
