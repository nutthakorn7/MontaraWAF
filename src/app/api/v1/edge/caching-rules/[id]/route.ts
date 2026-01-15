// Caching Rules by ID API
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    // In production, delete from database
    return NextResponse.json({ success: true, message: `Caching rule ${id} deleted` });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
}
