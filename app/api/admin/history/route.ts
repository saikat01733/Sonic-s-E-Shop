import { NextRequest, NextResponse } from 'next/server';
import { getStoreData } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req, 'audit.read');
    if (!guard.authorized) return guard.errorResponse!;

    const data = await getStoreData();
    return NextResponse.json({ success: true, logs: data.auditLogs || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
