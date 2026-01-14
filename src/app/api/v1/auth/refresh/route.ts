import { NextRequest, NextResponse } from 'next/server';
import {
    createAccessToken,
    verifyRefreshToken,
    userToPayload,
    findUserByEmail
} from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        let refresh_token = '';
        try {
            const body = await request.json();
            refresh_token = body.refresh_token;
        } catch {
            // Check cookie if no body
            refresh_token = request.cookies.get('refreshToken')?.value || '';
        }

        if (!refresh_token) {
            return NextResponse.json(
                { error: 'Refresh token is required' },
                { status: 400 }
            );
        }

        const payload = await verifyRefreshToken(refresh_token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        // Verify user still exists
        const user = findUserByEmail(payload.email);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        const newPayload = userToPayload(user);
        const accessToken = await createAccessToken(newPayload);

        return NextResponse.json({
            access_token: accessToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
