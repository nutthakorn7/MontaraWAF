// Bot Challenge API - Advanced verification with fingerprinting
import { NextRequest, NextResponse } from 'next/server';
import { advancedBotDetection } from '@/services/advanced-bot-detection';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const body = await request.json();

    // Handle fingerprint submission
    if (body.action === 'fingerprint') {
        const result = advancedBotDetection.trackFingerprint(ip, {
            userAgent,
            acceptLanguage: request.headers.get('accept-language') || '',
            acceptEncoding: request.headers.get('accept-encoding') || '',
            connection: request.headers.get('connection') || '',
            dnt: request.headers.get('dnt') || '',
            screenResolution: body.screenResolution,
            timezone: body.timezone,
            plugins: body.plugins,
            canvas: body.canvas,
            webgl: body.webgl,
        });

        return NextResponse.json({
            success: true,
            fingerprint: result.hash,
            isNew: result.isNew,
        });
    }

    // Handle behavior analysis
    if (body.action === 'behavior') {
        const analysis = advancedBotDetection.analyzeBehavior(ip, {
            requestsPerMinute: body.requestsPerMinute,
            avgTimeBetweenRequests: body.avgTimeBetweenRequests,
            hasMouseMovement: body.hasMouseMovement,
            hasKeyboardInput: body.hasKeyboardInput,
            jsChallengeTime: body.jsChallengeTime,
        });

        return NextResponse.json({
            success: true,
            score: analysis.score,
            isBot: analysis.isBot,
            reasons: analysis.reasons,
        });
    }

    // Handle good bot verification
    if (body.action === 'verify_good_bot') {
        const result = await advancedBotDetection.verifyGoodBot(ip, userAgent);
        return NextResponse.json({
            success: true,
            verified: result.verified,
            botType: result.botType,
        });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET() {
    const stats = advancedBotDetection.getFingerprintStats();
    return NextResponse.json({
        fingerprints: stats,
        updatedAt: new Date().toISOString(),
    });
}
