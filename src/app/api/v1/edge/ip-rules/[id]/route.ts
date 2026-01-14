// IP Rules by ID API
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams { params: { id: string } }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    return NextResponse.json({ success: true, message: `IP rule ${params.id} deleted` });
}
