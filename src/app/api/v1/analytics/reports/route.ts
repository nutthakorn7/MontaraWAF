// Analytics Reports API
import { NextRequest, NextResponse } from 'next/server';

interface Report {
    id: string;
    name: string;
    type: 'security' | 'traffic' | 'performance' | 'compliance';
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
    completedAt?: string;
    downloadUrl?: string;
}

let reports: Report[] = [
    { id: '1', name: 'Weekly Security Report', type: 'security', status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86000000).toISOString(), downloadUrl: '/reports/security-weekly.pdf' },
    { id: '2', name: 'Monthly Traffic Analysis', type: 'traffic', status: 'completed', createdAt: new Date(Date.now() - 172800000).toISOString(), completedAt: new Date(Date.now() - 172000000).toISOString(), downloadUrl: '/reports/traffic-monthly.pdf' },
    { id: '3', name: 'Compliance Audit', type: 'compliance', status: 'pending', createdAt: new Date().toISOString() },
];

export async function GET() {
    return NextResponse.json(reports);
}
