import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';
import { OrderStatusUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth-guard';

export async function PUT(req: NextRequest) {
  try {
    const guard = await requireAdmin(req, 'orders.update');
    if (!guard.authorized) return guard.errorResponse!;

    const adminUser = guard.user!;
    const author = adminUser.name || adminUser.email || 'Admin';

    const body = await req.json();
    const parsed = OrderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { orderId, status, adminNote, refundToWallet } = parsed.data;
    const updated = await updateOrderStatus(orderId, status as any, author, adminNote, refundToWallet);
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
