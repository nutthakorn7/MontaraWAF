import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'montara-waf-secret-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || 'montara-waf-refresh-secret-key-change-in-production'
);

export interface UserPayload extends JWTPayload {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function createAccessToken(payload: Omit<UserPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: Omit<UserPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as UserPayload;
    } catch {
        return null;
    }
}

export async function verifyRefreshToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, REFRESH_SECRET);
        return payload as UserPayload;
    } catch {
        return null;
    }
}

// In-memory user store (replace with DB in production)
interface StoredUser {
    id: string;
    email: string;
    name: string;
    password: string; // In production, this should be hashed
    role: string;
    created_at: string;
}

const users: Map<string, StoredUser> = new Map([
    ['demo@test.com', {
        id: 'user-1',
        email: 'demo@test.com',
        name: 'Demo User',
        password: 'demo1234',
        role: 'admin',
        created_at: new Date().toISOString(),
    }],
]);

export function findUserByEmail(email: string): StoredUser | undefined {
    return users.get(email.toLowerCase());
}

export function createUser(email: string, password: string, name: string): StoredUser {
    const user: StoredUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        password, // In production, hash this!
        role: 'user',
        created_at: new Date().toISOString(),
    };
    users.set(user.email, user);
    return user;
}

export function userToPayload(user: StoredUser): Omit<UserPayload, 'iat' | 'exp'> {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}
