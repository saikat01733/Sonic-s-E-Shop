import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';
import { OrderStatusUpdateSchema, sanitizeString } from '@/lib/validations';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { orderId, status, author } = parsed.data;
    const updated = await updateOrderStatus(orderId, status, author || 'admin');
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
