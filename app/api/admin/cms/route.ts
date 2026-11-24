import { NextRequest, NextResponse } from 'next/server';
import {
  getStoreData,
  updateSiteSettings,
  saveGame,
  deleteGame,
  savePackage,
  deletePackage,
  saveCoupon,
  deleteCoupon,
  getUsers,
  updateUser,
  recordAuditLog,
} from '@/lib/db';
import {
  SiteSettingsSchema,
  GameSchema,
  CouponSchema,
  UserUpdateSchema,
  sanitizeString,
} from '@/lib/validations';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.authorized) return guard.errorResponse!;

    const data = await getStoreData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.authorized) return guard.errorResponse!;

    const adminUser = guard.user!;
    const author = adminUser.name || adminUser.email || 'Admin';

    const body = await req.json();
    const action = sanitizeString(body.action || '');
    const payload = body.payload;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'update_settings': {
        const { settings, trustBadges } = payload || {};
        const parsedSettings = SiteSettingsSchema.safeParse(settings);
        if (!parsedSettings.success) {
          return NextResponse.json(
            { success: false, error: parsedSettings.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }

        const updated = await updateSiteSettings(parsedSettings.data, trustBadges || [], author);
        return NextResponse.json({ success: true, data: updated });
      }

      case 'save_game': {
        const parsedGame = GameSchema.safeParse(payload);
        if (!parsedGame.success) {
          return NextResponse.json(
            { success: false, error: parsedGame.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }
        const game = await saveGame(parsedGame.data as any, author);
        return NextResponse.json({ success: true, game });
      }

      case 'delete_game': {
        const id = sanitizeString(payload?.id || '');
        if (!id) return NextResponse.json({ success: false, error: 'Game ID required' }, { status: 400 });
        await deleteGame(id, author);
        return NextResponse.json({ success: true });
      }

      case 'save_package': {
        const gameId = sanitizeString(payload?.gameId || '');
        const pkg = payload?.pkg;
        if (!gameId || !pkg) {
          return NextResponse.json({ success: false, error: 'Missing gameId or package data' }, { status: 400 });
        }
        const saved = await savePackage(gameId, pkg, author);
        return NextResponse.json({ success: true, pkg: saved });
      }

      case 'delete_package': {
        const gameId = sanitizeString(payload?.gameId || '');
        const pkgId = sanitizeString(payload?.pkgId || '');
        if (!gameId || !pkgId) {
          return NextResponse.json({ success: false, error: 'Missing gameId or package ID' }, { status: 400 });
        }
        await deletePackage(gameId, pkgId, author);
        return NextResponse.json({ success: true });
      }

      case 'save_coupon': {
        const parsedCoupon = CouponSchema.safeParse(payload);
        if (!parsedCoupon.success) {
          return NextResponse.json(
            { success: false, error: parsedCoupon.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }
        const saved = await saveCoupon(parsedCoupon.data as any, author);
        return NextResponse.json({ success: true, coupon: saved });
      }

      case 'delete_coupon': {
        const id = sanitizeString(payload?.id || '');
        if (!id) return NextResponse.json({ success: false, error: 'Coupon ID required' }, { status: 400 });
        await deleteCoupon(id, author);
        return NextResponse.json({ success: true });
      }

      case 'get_users': {
        const users = await getUsers();
        return NextResponse.json({ success: true, users });
      }

      case 'update_user': {
        const parsedUser = UserUpdateSchema.safeParse(payload);
        if (!parsedUser.success) {
          return NextResponse.json(
            { success: false, error: parsedUser.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }

        // Only super_admin can promote or demote to/from admin or super_admin
        if (parsedUser.data.role && parsedUser.data.role !== 'user') {
          if (adminUser.role !== 'super_admin') {
            return NextResponse.json(
              { success: false, error: 'Only Super Administrators can assign staff or admin roles.' },
              { status: 403 }
            );
          }
        }

        const updated = await updateUser(parsedUser.data.id, parsedUser.data as any, author);
        return NextResponse.json({ success: true, user: updated });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown CMS action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
