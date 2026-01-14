// DDoS Protection API
import { NextResponse } from 'next/server';

export async function GET() {
    // Mock DDoS stats data
    const ddosStats = {
        status: 'protected',
        layer7: {
            requestsBlocked: 15234,
            activeThreats: 3,
            topAttackTypes: [
                { type: 'HTTP Flood', count: 8500 },
                { type: 'Slowloris', count: 4200 },
                { type: 'Application Layer', count: 2534 },
            ],
        },
        layer34: {
            packetsBlocked: 1250000,
            bandwidthSaved: '45.2 GB',
            topProtocols: [
                { protocol: 'UDP', percentage: 65 },
                { protocol: 'TCP SYN', percentage: 25 },
                { protocol: 'ICMP', percentage: 10 },
            ],
        },
        recentAttacks: [
            { id: '1', type: 'HTTP Flood', source: '192.168.1.100', timestamp: new Date().toISOString(), status: 'mitigated' },
            { id: '2', type: 'UDP Flood', source: '10.0.0.50', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'mitigated' },
        ],
        protectionLevel: 'high',
        autoMitigation: true,
    };

    return NextResponse.json(ddosStats);
}
