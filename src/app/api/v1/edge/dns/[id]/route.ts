// DNS Records by ID API
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams { params: { id: string } }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    return NextResponse.json({ success: true, message: `DNS record ${params.id} deleted` });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const body = await request.json();
    return NextResponse.json({ id: params.id, ...body, updatedAt: new Date().toISOString() });
}
