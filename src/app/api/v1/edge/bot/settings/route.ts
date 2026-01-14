// Bot Settings API
import { NextRequest, NextResponse } from 'next/server';

interface BotSettings {
    enabled: boolean;
    jsChallenge: boolean;
    captchaChallenge: boolean;
    blockKnownBad: boolean;
    allowSearchEngines: boolean;
    allowSocialMedia: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    customRules: {
        id: string;
        pattern: string;
        action: 'allow' | 'block' | 'challenge';
    }[];
}

let botSettings: BotSettings = {
    enabled: true,
    jsChallenge: true,
    captchaChallenge: false,
    blockKnownBad: true,
    allowSearchEngines: true,
    allowSocialMedia: true,
    sensitivityLevel: 'medium',
    customRules: [
        { id: '1', pattern: 'curl/*', action: 'challenge' },
        { id: '2', pattern: 'python-requests/*', action: 'block' },
    ],
};

export async function GET() {
    return NextResponse.json(botSettings);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    botSettings = { ...botSettings, ...body };
    return NextResponse.json(botSettings);
}
