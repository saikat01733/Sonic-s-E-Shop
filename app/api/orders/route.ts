import { NextRequest, NextResponse } from 'next/server';
import { getStoreData, createOrder, getMongoDb, logDbError } from '@/lib/db';
import { OrderItem } from '@/lib/types';
import { OrderSubmissionSchema, sanitizeString } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = sanitizeString(searchParams.get('id') || '');
    const phone = sanitizeString(searchParams.get('phone') || '');
    const currentUser = await getCurrentUser(req);

    const db = await getMongoDb();
    if (!db) {
      logDbError('GET /api/orders');
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    // 1. Specific Order Search
    if (orderId) {
      const match = await db.collection<OrderItem>('orders').findOne({
        id: { $regex: new RegExp(`^${orderId}$`, 'i') },
      });
      if (!match) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: match });
    }

    // 2. Guest Phone Number Tracking
    if (phone) {
      const cleanPhone = phone.trim();
      const matches = await db
        .collection<OrderItem>('orders')
        .find({
          $or: [
            { 'customData.whatsapp': { $regex: cleanPhone } },
            { 'customData.phone': { $regex: cleanPhone } },
            { senderLastDigits: { $regex: cleanPhone } },
          ],
        })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      return NextResponse.json({ success: true, orders: matches });
    }

    // 3. Authenticated User Orders
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
        const allOrders = await db.collection<OrderItem>('orders').find({}).sort({ timestamp: -1 }).limit(100).toArray();
        return NextResponse.json({ success: true, orders: allOrders });
      }

      const userOrders = await db
        .collection<OrderItem>('orders')
        .find({
          $or: [
            { userId: currentUser.id },
            ...(currentUser.email ? [{ 'customData.email': currentUser.email }] : []),
            ...(currentUser.phone ? [{ 'customData.whatsapp': currentUser.phone }, { senderLastDigits: currentUser.phone }] : []),
          ],
        })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      return NextResponse.json({ success: true, orders: userOrders });
    }

    // Default: recent orders for guest exploration
    const recent = await db.collection<OrderItem>('orders').find({}).sort({ timestamp: -1 }).limit(20).toArray();
    return NextResponse.json({ success: true, orders: recent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const currentUser = await getCurrentUser(req);

    // Strict Zod schema validation
    const parsed = OrderSubmissionSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { gameId, packageIds, packages, paymentMethod, senderLastDigits, customData, couponCode } = parsed.data;

    // Resolve packageIds: either provided or extracted from packages array
    const resolvedPackageIds = packageIds && packageIds.length > 0
      ? packageIds
      : (packages || []).map(p => p.id);

    if (resolvedPackageIds.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one package must be selected' }, { status: 400 });
    }

    // If payment method is Wallet, ensure user is authenticated
    if (paymentMethod === 'Wallet' && !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to complete payment using your Gamer Wallet.' },
        { status: 401 }
      );
    }

    // Extra sanitization
    const sanitizedGameId = sanitizeString(gameId);
    const sanitizedDigits = sanitizeString(senderLastDigits || 'WALLET');
    const sanitizedCoupon = couponCode ? sanitizeString(couponCode).toUpperCase() : undefined;

    const sanitizedCustomData: Record<string, any> = {};
    if (customData && typeof customData === 'object') {
      for (const [key, val] of Object.entries(customData)) {
        sanitizedCustomData[sanitizeString(key)] = typeof val === 'string' ? sanitizeString(val) : val;
      }
    }

    // Call atomic createOrder with SERVER-SIDE price recalculation
    const savedOrder = await createOrder({
      gameId: sanitizedGameId,
      packageIds: resolvedPackageIds,
      paymentMethod,
      senderLastDigits: sanitizedDigits,
      customData: sanitizedCustomData,
      couponCode: sanitizedCoupon,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
    });

    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: `Order #${savedOrder.id} placed successfully! Delivery in 1-10 mins.`,
    });
  } catch (error: any) {
    logDbError('POST /api/orders', error);
    const isDbUnavailable = error?.message?.includes('Database') || error?.name?.includes('Mongo');
    return NextResponse.json(
      { success: false, error: isDbUnavailable ? 'Database service unavailable' : (error.message || 'Failed to place order') },
      { status: isDbUnavailable ? 503 : 400 }
    );
  }
}
