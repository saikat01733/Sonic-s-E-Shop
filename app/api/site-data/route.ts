import { NextResponse } from 'next/server';
import { getStoreData } from '@/lib/db';
import { isMongoConnected } from '@/lib/mongodb';
import { isFirebaseConfigured } from '@/lib/firebase';

export async function GET() {
  try {
    const data = await getStoreData();
    const mongoStatus = await isMongoConnected();
    const firebaseStatus = isFirebaseConfigured();

    // Mask sensitive admin pin in public endpoint
    const publicSettings = { ...data.settings };
    delete (publicSettings as any).adminPin;

    return NextResponse.json({
      success: true,
      data: {
        settings: publicSettings,
        trustBadges: data.trustBadges,
        games: data.games,
        coupons: data.coupons.filter(c => c.active),
        system: {
          mongoConnected: mongoStatus,
          firebaseConfigured: firebaseStatus
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch site data' },
      { status: 500 }
    );
  }
}
