// SSL/TLS Management API Routes

import { NextRequest, NextResponse } from 'next/server';
import { SSLManagementService } from '@/waf-engine/services/ssl-management-service';

function getService(): SSLManagementService {
    return new SSLManagementService();
}

// GET /api/v1/waf/ssl - List certificates & settings
// POST /api/v1/waf/ssl - Request new certificate
export async function GET(request: NextRequest) {
    try {
        const service = getService();
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');

        if (type === 'settings') {
            const settings = await service.getSettings();
            return NextResponse.json(settings);
        }

        if (type === 'expiring') {
            const days = parseInt(searchParams.get('days') || '30');
            const expiring = await service.checkExpiringCerts(days);
            return NextResponse.json({
                expiring,
                count: expiring.length,
                threshold: days,
            });
        }

        // Default: list all certificates
        const certificates = await service.listCertificates();
        const settings = await service.getSettings();

        return NextResponse.json({
            certificates,
            total: certificates.length,
            settings,
        });
    } catch (error) {
        console.error('SSL list error:', error);
        return NextResponse.json({ error: 'Failed to fetch SSL data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const service = getService();
        const body = await request.json();
        const { domain, email, type, autoRenew, customCert } = body;

        if (!domain) {
            return NextResponse.json({ error: 'Domain required' }, { status: 400 });
        }

        if (type === 'letsencrypt' && !email) {
            return NextResponse.json(
                { error: 'Email required for Let\'s Encrypt' },
                { status: 400 }
            );
        }

        const cert = await service.requestCertificate({
            domain,
            email,
            type: type || 'letsencrypt',
            autoRenew,
            customCert,
        });

        return NextResponse.json(cert, { status: 201 });
    } catch (error) {
        console.error('SSL request error:', error);
        return NextResponse.json(
            { error: 'Failed to request certificate' },
            { status: 500 }
        );
    }
}

// PATCH /api/v1/waf/ssl - Update SSL settings
export async function PATCH(request: NextRequest) {
    try {
        const service = getService();
        const body = await request.json();

        const settings = await service.updateSettings(body);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('SSL settings error:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
