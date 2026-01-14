// WAF IPs API - With CrowdSec Sync
import { NextRequest, NextResponse } from 'next/server';
import { crowdsecSync } from '@/services/crowdsec-sync';
import { apisixSync } from '@/services/apisix-sync';

interface IPEntry {
    id: string;
    ip: string;
    type: 'blacklist' | 'whitelist';
    reason: string;
    duration?: string;
    createdAt: string;
}

// In-memory store (in production, use database)
let ipList: IPEntry[] = [
    { id: '1', ip: '192.168.1.100', type: 'blacklist', reason: 'Known attacker', createdAt: new Date().toISOString() },
    { id: '2', ip: '10.0.0.0/8', type: 'whitelist', reason: 'Internal network', createdAt: new Date().toISOString() },
];

export async function GET() {
    // Also fetch live decisions from CrowdSec
    let crowdsecDecisions: any[] = [];
    try {
        crowdsecDecisions = await crowdsecSync.listDecisions();
    } catch (e) {
        // Continue with local list if CrowdSec unavailable
    }

    return NextResponse.json({
        entries: ipList,
        total: ipList.length,
        crowdsecDecisions: crowdsecDecisions.length,
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newEntry: IPEntry = {
        id: `ip-${Date.now()}`,
        ip: body.ip,
        type: body.type || 'blacklist',
        reason: body.reason || 'Manual entry',
        duration: body.duration || '24h',
        createdAt: new Date().toISOString(),
    };

    let synced = false;

    // Sync to CrowdSec and APISIX
    if (body.type === 'blacklist' || !body.type) {
        // Add to CrowdSec ban list
        synced = await crowdsecSync.banIP(newEntry.ip, newEntry.reason, newEntry.duration);
        // Also add to APISIX IP restriction
        await apisixSync.addIPToBlacklist(newEntry.ip);
    } else if (body.type === 'whitelist') {
        // Remove any existing ban and add to whitelist
        synced = await crowdsecSync.whitelistIP(newEntry.ip, newEntry.reason);
    }

    ipList.push(newEntry);

    return NextResponse.json({
        ...newEntry,
        synced
    }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const ip = request.nextUrl.searchParams.get('ip');
    const id = request.nextUrl.searchParams.get('id');

    if (!ip && !id) {
        return NextResponse.json({ error: 'IP or ID required' }, { status: 400 });
    }

    const targetIP = ip || ipList.find(e => e.id === id)?.ip;

    if (targetIP) {
        // Remove from CrowdSec
        const csSuccess = await crowdsecSync.unbanIP(targetIP);
        // Remove from APISIX
        const apSuccess = await apisixSync.removeIPFromBlacklist(targetIP);

        // Remove from local list
        ipList = ipList.filter(e => e.ip !== targetIP && e.id !== id);

        return NextResponse.json({
            success: true,
            synced: csSuccess || apSuccess
        });
    }

    return NextResponse.json({ error: 'IP not found' }, { status: 404 });
}
