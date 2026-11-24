import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const savedUser = await syncUser({
      id: body.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      avatar: body.avatar,
      role: body.role,
      walletBalance: body.walletBalance,
    });

    return NextResponse.json({ success: true, user: savedUser });
  } catch (error: any) {
    console.error('[API] /api/auth/sync-user error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
