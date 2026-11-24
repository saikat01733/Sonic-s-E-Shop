import { NextRequest, NextResponse } from 'next/server';
import { getStoreData } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, username, password } = body;

    const data = await getStoreData();
    const expectedPin = data.settings.adminPin || 'sonic2026';
    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPass = process.env.ADMIN_PASSWORD || 'sonic2026';

    const isPinMatch = pin && pin === expectedPin;
    const isCredMatch = username === envUser && password === envPass;

    if (isPinMatch || isCredMatch) {
      // Simple signed token for admin session
      const token = `sonic-admin-${Buffer.from(expectedPin + ':' + Date.now()).toString('base64')}`;
      return NextResponse.json({
        success: true,
        token,
        admin: { username: username || 'admin', role: 'SuperAdmin' }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid PIN or username/password.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
