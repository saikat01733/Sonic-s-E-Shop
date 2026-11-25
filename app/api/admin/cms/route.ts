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
  deleteOrder,
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUser,
  deleteUser,
  logDbError,
} from '@/lib/db';
import {
  SiteSettingsSchema,
  TrustBadgeSchema,
  GameSchema,
  PackageSchema,
  CouponSchema,
  UserUpdateSchema,
  UserCreateSchema,
  sanitizeString,
} from '@/lib/validations';
import { requireAdmin } from '@/lib/auth-guard';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req, 'orders.read');
    if (!guard.authorized) return guard.errorResponse!;

    const data = await getStoreData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    logDbError('GET /api/admin/cms', error);
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
            { success: false, error: parsedSettings.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
            { status: 400 }
          );
        }

        let validatedBadges: any[] | undefined = undefined;
        if (Array.isArray(trustBadges)) {
          validatedBadges = [];
          for (const b of trustBadges) {
            const parsedBadge = TrustBadgeSchema.safeParse(b);
            if (!parsedBadge.success) {
              return NextResponse.json(
                { success: false, error: parsedBadge.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
              );
            }
            validatedBadges.push({
              ...parsedBadge.data,
              sub: parsedBadge.data.sub || parsedBadge.data.subtitle || parsedBadge.data.desc || '',
            });
          }
        }

        const updated = await updateSiteSettings(parsedSettings.data as any, validatedBadges, author);
        return NextResponse.json({ success: true, data: updated });
      }

      case 'save_game': {
        const parsedGame = GameSchema.safeParse(payload);
        if (!parsedGame.success) {
          return NextResponse.json(
            { success: false, error: parsedGame.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
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
        const parsedPkg = PackageSchema.safeParse(pkg);
        if (!parsedPkg.success) {
          return NextResponse.json(
            { success: false, error: parsedPkg.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }
        const saved = await savePackage(gameId, parsedPkg.data as any, author);
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

      case 'delete_order': {
        const id = sanitizeString(payload?.id || '');
        if (!id) return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        await deleteOrder(id, author);
        return NextResponse.json({ success: true });
      }

      case 'get_users': {
        const users = await getUsers();
        return NextResponse.json({ success: true, users });
      }

      case 'create_user': {
        const parsedCreate = UserCreateSchema.safeParse(payload);
        if (!parsedCreate.success) {
          return NextResponse.json(
            { success: false, error: parsedCreate.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }

        if (parsedCreate.data.role === 'super_admin' && adminUser.role !== 'super_admin') {
          return NextResponse.json(
            { success: false, error: 'Only Super Administrators can create another Super Admin.' },
            { status: 403 }
          );
        }

        const passwordHash = await hashPassword(parsedCreate.data.password);
        const created = await createUserByAdmin(
          {
            name: parsedCreate.data.name,
            email: parsedCreate.data.email,
            phone: parsedCreate.data.phone,
            passwordHash,
            role: parsedCreate.data.role,
            walletBalance: parsedCreate.data.walletBalance,
          },
          author
        );
        return NextResponse.json({ success: true, user: created }, { status: 201 });
      }

      case 'update_user': {
        const parsedUser = UserUpdateSchema.safeParse(payload);
        if (!parsedUser.success) {
          return NextResponse.json(
            { success: false, error: parsedUser.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
            { status: 400 }
          );
        }

        const existingTarget = await getUserById(parsedUser.data.id);
        const requestedRole = parsedUser.data.role;

        // Only super_admin can assign super_admin or modify an existing super_admin's role
        if (requestedRole) {
          if (requestedRole === 'super_admin' && adminUser.role !== 'super_admin') {
            return NextResponse.json(
              { success: false, error: 'Only Super Administrators can assign the super_admin role.' },
              { status: 403 }
            );
          }
          if (existingTarget?.role === 'super_admin' && requestedRole !== 'super_admin' && adminUser.role !== 'super_admin') {
            return NextResponse.json(
              { success: false, error: 'Only Super Administrators can demote a Super Admin.' },
              { status: 403 }
            );
          }
        }

        const cleanUpdates: Record<string, any> = {};
        if (parsedUser.data.name) cleanUpdates.name = sanitizeString(parsedUser.data.name);
        if (parsedUser.data.email !== undefined && parsedUser.data.email !== null && parsedUser.data.email !== '') {
          cleanUpdates.email = parsedUser.data.email.toLowerCase().trim();
        }
        if (parsedUser.data.phone !== undefined && parsedUser.data.phone !== null) {
          cleanUpdates.phone = sanitizeString(parsedUser.data.phone);
        }
        if (requestedRole) cleanUpdates.role = requestedRole;
        if (typeof parsedUser.data.walletBalance === 'number') {
          cleanUpdates.walletBalance = parsedUser.data.walletBalance;
        }
        if (parsedUser.data.status) cleanUpdates.status = parsedUser.data.status;

        const updated = await updateUser(parsedUser.data.id, cleanUpdates, author);
        return NextResponse.json({ success: true, user: updated });
      }

      case 'delete_user': {
        const id = sanitizeString(payload?.id || '');
        if (!id) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        if (id === adminUser.id) {
          return NextResponse.json({ success: false, error: 'You cannot delete your own active account.' }, { status: 400 });
        }
        const target = await getUserById(id);
        if (target?.role === 'super_admin' && adminUser.role !== 'super_admin') {
          return NextResponse.json({ success: false, error: 'Only Super Administrators can delete a Super Admin.' }, { status: 403 });
        }
        await deleteUser(id, author);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown CMS action' }, { status: 400 });
    }
  } catch (error: any) {
    logDbError('POST /api/admin/cms', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
