// DNS Records API
import { NextRequest, NextResponse } from 'next/server';

interface DNSRecord {
    id: string;
    type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS';
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
    createdAt: string;
}

let dnsRecords: DNSRecord[] = [
    { id: '1', type: 'A', name: '@', content: '192.168.1.1', ttl: 3600, proxied: true, createdAt: new Date().toISOString() },
    { id: '2', type: 'CNAME', name: 'www', content: 'example.com', ttl: 3600, proxied: true, createdAt: new Date().toISOString() },
    { id: '3', type: 'MX', name: '@', content: 'mail.example.com', ttl: 3600, proxied: false, createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json(dnsRecords);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newRecord: DNSRecord = {
        id: `dns-${Date.now()}`,
        type: body.type,
        name: body.name,
        content: body.content,
        ttl: body.ttl || 3600,
        proxied: body.proxied ?? false,
        createdAt: new Date().toISOString(),
    };
    dnsRecords.push(newRecord);
    return NextResponse.json(newRecord, { status: 201 });
}
