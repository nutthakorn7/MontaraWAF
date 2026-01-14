// Generate Report API
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    const newReport = {
        id: `report-${Date.now()}`,
        name: body.name || 'Custom Report',
        type: body.type || 'security',
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    // In production, trigger async report generation
    return NextResponse.json(newReport, { status: 201 });
}
