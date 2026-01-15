// IP Rules by ID API
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return NextResponse.json({ success: true, message: `IP rule ${id} deleted` });
}
