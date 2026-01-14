import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, findUserByEmail } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const payload = await verifyAccessToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Get fresh user data
        const user = findUserByEmail(payload.email);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
