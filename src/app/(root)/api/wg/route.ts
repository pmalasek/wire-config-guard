import { activeConnections } from '@/actions/wg_actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    return NextResponse.json({ value: 5 });
}

export async function GET(request: NextRequest) {
    const activeConns = await activeConnections();
    console.log("Active Connections:", activeConns);
    return NextResponse.json(activeConns);
}
