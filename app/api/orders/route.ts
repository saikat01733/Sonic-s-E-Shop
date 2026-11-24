import { NextRequest, NextResponse } from 'next/server';
import { getStoreData, createOrder } from '@/lib/db';
import { OrderItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    const phone = searchParams.get('phone');
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

    // Return all customer orders (or latest 20)
    return NextResponse.json({ success: true, orders: data.orders.slice(0, 30) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, gameName, packages, totalAmount, paymentMethod, senderLastDigits, customData } = body;

    if (!gameId || !packages || packages.length === 0 || !senderLastDigits) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const orderId = 'SONIC-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newOrder: OrderItem = {
      id: orderId,
      gameId,
      gameName,
      packages,
      totalAmount,
      paymentMethod: paymentMethod || 'bKash',
      senderLastDigits,
      customData: customData || {},
      status: 'Pending',
      date: orderDate,
      timestamp: Date.now()
    };

    const saved = await createOrder(newOrder);
    return NextResponse.json({ success: true, order: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
