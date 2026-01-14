import { NextRequest, NextResponse } from 'next/server';
import {
    createAccessToken,
    createRefreshToken,
    findUserByEmail,
    createUser,
    userToPayload
} from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                { error: 'Password must be at least 4 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const user = createUser(email, password, name);
        const payload = userToPayload(user);
        const accessToken = await createAccessToken(payload);
        const refreshToken = await createRefreshToken(payload);

        return NextResponse.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                created_at: user.created_at,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
