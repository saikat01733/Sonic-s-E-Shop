import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guard';
import { getMongoDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const guard = await requireUser(req);
    if (!guard.authorized) return guard.errorResponse!;

    const user = guard.user!;
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const transactions = await db
      .collection('walletTransactions')
      .find({ userId: user.id })
      .sort({ createdAt: -1, timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      balance: user.walletBalance || 0,
      transactions,
    });
  } catch (error: any) {
    console.error('[API] /api/wallet/transactions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
