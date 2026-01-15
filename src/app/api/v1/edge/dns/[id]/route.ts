// DNS Records by ID API
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return NextResponse.json({ success: true, message: `DNS record ${id} deleted` });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
}
