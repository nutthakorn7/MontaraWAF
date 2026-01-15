// SSL Certificate Individual Routes

import { NextRequest, NextResponse } from 'next/server';
import { SSLManagementService } from '@/services/ssl-management-service';

function getService(): SSLManagementService {
    return new SSLManagementService();
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/v1/waf/ssl/[id] - Get single certificate
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const service = getService();
        const cert = await service.getCertificate(id);

        if (!cert) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json(cert);
    } catch (error) {
        console.error('Get certificate error:', error);
        return NextResponse.json({ error: 'Failed to get certificate' }, { status: 500 });
    }
}

// POST /api/v1/waf/ssl/[id]/renew - Renew certificate
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const service = getService();
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');

        if (action === 'renew') {
            const cert = await service.renewCertificate(id);
            return NextResponse.json({
                success: true,
                message: 'Certificate renewal initiated',
                certificate: cert,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Renew certificate error:', error);
        return NextResponse.json({ error: 'Failed to renew certificate' }, { status: 500 });
    }
}

// DELETE /api/v1/waf/ssl/[id] - Delete certificate
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const service = getService();
        await service.deleteCertificate(id);

        return NextResponse.json({
            success: true,
            message: 'Certificate deleted',
        });
    } catch (error) {
        console.error('Delete certificate error:', error);
        return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
    }
}
