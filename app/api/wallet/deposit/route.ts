import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guard';
import { WalletDepositSchema, sanitizeString } from '@/lib/validations';
import { getMongoDb, recordAuditLog, logDbError } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const guard = await requireUser(req);
    if (!guard.authorized) return guard.errorResponse!;

    const user = guard.user!;
    const body = await req.json();

    const parsed = WalletDepositSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid deposit information' },
        { status: 400 }
      );
    }

    const { amount, paymentMethod, senderNumber, trxId } = parsed.data;
    const db = await getMongoDb();
    if (!db) {
      logDbError('POST /api/wallet/deposit');
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    // Prevent duplicate TrxID submissions
    const existingTrx = await db.collection('walletTransactions').findOne({
      trxId: trxId.toUpperCase(),
    });
    if (existingTrx) {
      return NextResponse.json(
        { success: false, error: `Transaction ID '${trxId}' has already been submitted.` },
        { status: 409 }
      );
    }

    const depositTransaction = {
      id: `wtx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone || senderNumber,
      type: 'deposit_request',
      status: 'pending', // Pending admin verification
      amount,
      paymentMethod,
      senderNumber,
      trxId: trxId.toUpperCase(),
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    await db.collection('walletTransactions').insertOne(depositTransaction);

    await recordAuditLog({
      action: 'create',
      entity: 'wallet_deposit',
      entityId: depositTransaction.id,
      author: user.name || user.email || 'Customer',
      details: `Submitted ৳${amount} deposit via ${paymentMethod} (TrxID: ${trxId})`,
    });

    return NextResponse.json({
      success: true,
      transaction: depositTransaction,
      message: `Deposit request for ৳${amount} submitted! It will be verified and credited within 5-15 mins.`,
    });
  } catch (error: any) {
    logDbError('POST /api/wallet/deposit exception', error);
    const isDbUnavailable = error?.message?.includes('Database') || error?.name?.includes('Mongo');
    return NextResponse.json({ success: false, error: isDbUnavailable ? 'Database service unavailable' : (error.message || 'Deposit failed') }, { status: isDbUnavailable ? 503 : 500 });
  }
}
