// Auth Login API
import { NextRequest, NextResponse } from 'next/server';
import { createAccessToken, createRefreshToken } from '@/lib/jwt';

// Mock users (replace with database in production)
const users = [
    { id: '1', email: 'admin@montara.io', password: 'admin123', name: 'Admin User', role: 'admin' },
    { id: '2', email: 'user@montara.io', password: 'user123', name: 'Regular User', role: 'user' },
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const accessToken = await createAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = await createRefreshToken({ userId: user.id });

        const response = NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            accessToken,
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
