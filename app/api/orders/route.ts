import { NextRequest, NextResponse } from 'next/server';
import { getStoreData, createOrder } from '@/lib/db';
import { OrderItem } from '@/lib/types';
import { OrderSubmissionSchema, sanitizeString } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = sanitizeString(searchParams.get('id') || '');
    const phone = sanitizeString(searchParams.get('phone') || '');
    const data = await getStoreData();

    if (orderId) {
      const match = data.orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
      if (!match) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: match });
    }

    if (phone) {
      const matches = data.orders.filter(o => 
        o.customData?.whatsapp?.includes(phone) || o.senderLastDigits?.includes(phone)
      );
      return NextResponse.json({ success: true, orders: matches });
    }

    // Return latest customer orders
    return NextResponse.json({ success: true, orders: data.orders.slice(0, 30) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

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

    const { gameId, gameName, packages, totalAmount, paymentMethod, senderLastDigits, customData } = parsed.data;

    // Extra sanitization against script attacks
    const sanitizedGameId = sanitizeString(gameId);
    const sanitizedGameName = sanitizeString(gameName);
    const sanitizedDigits = sanitizeString(senderLastDigits);

    // Sanitize customData keys and string values
    const sanitizedCustomData: Record<string, any> = {};
    if (customData && typeof customData === 'object') {
      for (const [key, val] of Object.entries(customData)) {
        sanitizedCustomData[sanitizeString(key)] = typeof val === 'string' ? sanitizeString(val) : val;
      }
    }

    const orderId = 'SONIC-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newOrder: OrderItem = {
      id: orderId,
      gameId: sanitizedGameId,
      gameName: sanitizedGameName,
      packages,
      totalAmount,
      paymentMethod,
      senderLastDigits: sanitizedDigits,
      customData: sanitizedCustomData,
      status: 'Pending',
      date: orderDate,
      timestamp: Date.now(),
    };

    const saved = await createOrder(newOrder);
    return NextResponse.json({ success: true, order: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
