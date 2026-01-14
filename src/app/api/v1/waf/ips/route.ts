// IP Management API Routes
// Whitelist, Blacklist, and Geo-blocking endpoints

import { NextRequest, NextResponse } from 'next/server';
import { IPManagementService } from '@/waf-engine/services/ip-management-service';

function getService(): IPManagementService {
    return new IPManagementService();
}

// GET /api/v1/waf/ips - Get all IPs (blacklist + whitelist)
// POST /api/v1/waf/ips - Add IP to blacklist or whitelist
export async function GET(request: NextRequest) {
    try {
        const service = getService();
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');

        if (type === 'blacklist') {
            const entries = await service.getBlacklist();
            return NextResponse.json({ entries, type: 'blacklist' });
        }

        if (type === 'whitelist') {
            const entries = await service.getWhitelist();
            return NextResponse.json({ entries, type: 'whitelist' });
        }

        if (type === 'stats') {
            const stats = await service.getStats();
            return NextResponse.json(stats);
        }

        // Default: return all
        const entries = await service.getAllDecisions();
        return NextResponse.json({ entries, total: entries.length });
    } catch (error) {
        console.error('IP list error:', error);
        return NextResponse.json({ error: 'Failed to fetch IPs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const service = getService();
        const body = await request.json();
        const { ip, type, reason, duration } = body;

        if (!ip) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }

        // Validate IP format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        if (!ipRegex.test(ip)) {
            return NextResponse.json({ error: 'Invalid IP format' }, { status: 400 });
        }

        if (type === 'whitelist') {
            await service.addToWhitelist(ip, reason);
            return NextResponse.json({
                success: true,
                message: `${ip} added to whitelist`
            });
        } else {
            await service.addToBlacklist(ip, reason, duration);
            return NextResponse.json({
                success: true,
                message: `${ip} added to blacklist`
            });
        }
    } catch (error) {
        console.error('Add IP error:', error);
        return NextResponse.json({ error: 'Failed to add IP' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const service = getService();
        const searchParams = request.nextUrl.searchParams;
        const ip = searchParams.get('ip');
        const type = searchParams.get('type') || 'blacklist';

        if (!ip) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }

        if (type === 'whitelist') {
            await service.removeFromWhitelist(ip);
        } else {
            await service.removeFromBlacklist(ip);
        }

        return NextResponse.json({
            success: true,
            message: `${ip} removed from ${type}`
        });
    } catch (error) {
        console.error('Remove IP error:', error);
        return NextResponse.json({ error: 'Failed to remove IP' }, { status: 500 });
    }
}
