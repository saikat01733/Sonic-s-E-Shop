import { NextRequest, NextResponse } from 'next/server';
import {
  getStoreData,
  updateSiteSettings,
  saveGame,
  deleteGame,
  savePackage,
  deletePackage,
  saveCoupon,
  deleteCoupon
} from '@/lib/db';

export async function GET() {
  try {
    const data = await getStoreData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, author } = body;

    switch (action) {
      case 'update_settings': {
        const { settings, trustBadges } = payload;
        const updated = await updateSiteSettings(settings, trustBadges, author || 'admin');
        return NextResponse.json({ success: true, data: updated });
      }

      case 'save_game': {
        const game = await saveGame(payload, author || 'admin');
        return NextResponse.json({ success: true, game });
      }

      case 'delete_game': {
        await deleteGame(payload.id, author || 'admin');
        return NextResponse.json({ success: true });
      }

      case 'save_package': {
        const { gameId, pkg } = payload;
        const saved = await savePackage(gameId, pkg, author || 'admin');
        return NextResponse.json({ success: true, pkg: saved });
      }

      case 'delete_package': {
        const { gameId, pkgId } = payload;
        await deletePackage(gameId, pkgId, author || 'admin');
        return NextResponse.json({ success: true });
      }

      case 'save_coupon': {
        const saved = await saveCoupon(payload, author || 'admin');
        return NextResponse.json({ success: true, coupon: saved });
      }

      case 'delete_coupon': {
        await deleteCoupon(payload.id, author || 'admin');
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown CMS action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
