import { NextRequest, NextResponse } from 'next/server';
import {
    createAccessToken,
    verifyRefreshToken,
    userToPayload,
    findUserByEmail
} from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const { refresh_token } = await request.json();

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
