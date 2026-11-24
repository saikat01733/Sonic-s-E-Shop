import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getStoreData } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, author } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 });
    }

    const updated = await updateOrderStatus(orderId, status, author || 'admin');
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
