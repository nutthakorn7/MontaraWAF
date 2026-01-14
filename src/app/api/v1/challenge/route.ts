// Challenge API - Validate JS challenge responses
import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Challenge secret (in production, use env variable)
const CHALLENGE_SECRET = process.env.CHALLENGE_SECRET || 'montara-challenge-secret-2026';

interface ChallengeToken {
    ip: string;
    timestamp: number;
    solved: boolean;
}

// In-memory store for validated challenges (use Redis in production)
const validatedChallenges: Map<string, ChallengeToken> = new Map();

// Generate challenge token
function generateChallenge(ip: string): { challenge: string; token: string } {
    const timestamp = Date.now();
    const data = `${ip}:${timestamp}:${CHALLENGE_SECRET}`;
    const token = crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);

    // Create a math challenge
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    const challenge = `${a} + ${b}`;
    const answer = a + b;

    // Store expected answer (encrypted)
    const answerHash = crypto.createHash('sha256')
        .update(`${token}:${answer}:${CHALLENGE_SECRET}`)
        .digest('hex');

    validatedChallenges.set(token, {
        ip,
        timestamp,
        solved: false,
    });

    return {
        challenge,
        token,
    };
}

// Verify challenge answer
function verifyChallenge(token: string, answer: string, ip: string): boolean {
    const stored = validatedChallenges.get(token);

    if (!stored) return false;
    if (stored.ip !== ip) return false;
    if (Date.now() - stored.timestamp > 300000) { // 5 min expiry
        validatedChallenges.delete(token);
        return false;
    }

    // For JS challenge, verify the computed hash
    const expectedHash = crypto.createHash('sha256')
        .update(`${token}:${CHALLENGE_SECRET}`)
        .digest('hex').slice(0, 16);

    if (answer === expectedHash) {
        stored.solved = true;
        validatedChallenges.set(token, stored);
        return true;
    }

    return false;
}

// Check if IP has valid challenge
export function hasValidChallenge(ip: string): boolean {
    for (const [, token] of validatedChallenges) {
        if (token.ip === ip && token.solved && Date.now() - token.timestamp < 3600000) {
            return true;
        }
    }
    return false;
}

// GET - Generate new challenge
export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const { challenge, token } = generateChallenge(ip);

    return NextResponse.json({
        challenge,
        token,
        type: 'js_challenge',
        expiresIn: 300, // 5 minutes
        instructions: 'Complete the JavaScript challenge to verify you are human',
    });
}

// POST - Verify challenge answer
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const body = await request.json();
    const { token, answer } = body;

    if (!token || !answer) {
        return NextResponse.json(
            { error: 'Token and answer required' },
            { status: 400 }
        );
    }

    const isValid = verifyChallenge(token, answer, ip);

    if (isValid) {
        // Generate session cookie
        const sessionToken = crypto.createHash('sha256')
            .update(`${ip}:${Date.now()}:verified:${CHALLENGE_SECRET}`)
            .digest('hex');

        const response = NextResponse.json({
            success: true,
            message: 'Challenge completed successfully',
            redirect: '/',
        });

        // Set verification cookie (1 hour)
        response.cookies.set('montara_verified', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
        });

        return response;
    }

    return NextResponse.json(
        { error: 'Invalid challenge response', success: false },
        { status: 403 }
    );
}
