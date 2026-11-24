import { NextResponse } from 'next/server';
import { getStoreData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getStoreData();
    return NextResponse.json({ success: true, logs: data.auditLogs || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
