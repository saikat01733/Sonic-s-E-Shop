import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, logDbError } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { UserProfile, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const db = await getMongoDb();
    if (!db) {
      logDbError('POST /api/auth/sync-user');
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const superAdminEmail = (process.env.ADMIN_EMAIL || 'saikatahmmad77@gmail.com').toLowerCase().trim();
    const userEmail = (body.email || '').toLowerCase().trim();

    // Check if user already exists in DB
    const existing = await db.collection<UserProfile>('users').findOne({
      $or: [{ id: body.id }, ...(userEmail ? [{ email: userEmail }] : [])],
    });

    let finalRole: UserRole = 'user';
    let finalBalance = 100;
    let userId = body.id;

    if (existing) {
      // KEEP DB role and balance - client NEVER overrides!
      finalRole = existing.role || 'user';
      finalBalance = typeof existing.walletBalance === 'number' ? existing.walletBalance : 0;
      userId = existing.id;

      // Update name/avatar/lastLoginAt only
      await db.collection('users').updateOne(
        { id: userId },
        {
          $set: {
            name: body.name || existing.name,
            avatar: body.avatar || existing.avatar,
            lastLoginAt: new Date().toISOString(),
          },
        }
      );
    } else {
      // New user
      if (userEmail && userEmail === superAdminEmail) {
        finalRole = 'super_admin';
        finalBalance = 25000;
      } else {
        finalRole = 'user'; // STRICTLY FORCED TO USER
        finalBalance = 100; // Welcome Bonus
      }

      const newUser: UserProfile = {
        id: userId,
        name: body.name || 'Gamer User',
        email: userEmail || undefined,
        phone: body.phone || undefined,
        avatar: body.avatar || undefined,
        role: finalRole,
        walletBalance: finalBalance,
        status: 'active',
        ordersCount: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await db.collection('users').insertOne(newUser as any);

      if (finalBalance > 0) {
        await db.collection('walletTransactions').insertOne({
          id: `wtx-${Date.now()}`,
          userId,
          type: 'welcome_bonus',
          amount: finalBalance,
          balanceAfter: finalBalance,
          description: 'Welcome Bonus Credit',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const safeUser: UserProfile = {
      id: userId,
      name: body.name || existing?.name || 'Gamer User',
      email: userEmail || existing?.email,
      phone: body.phone || existing?.phone,
      avatar: body.avatar || existing?.avatar,
      role: finalRole,
      walletBalance: finalBalance,
      status: existing?.status || 'active',
      ordersCount: existing?.ordersCount || 0,
      createdAt: existing?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Set server-side session token
    const token = await createSessionToken({
      userId: safeUser.id,
      role: safeUser.role,
      email: safeUser.email,
      phone: safeUser.phone,
      name: safeUser.name,
    });

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    logDbError('POST /api/auth/sync-user exception', error);
    const isDbUnavailable = error?.message?.includes('Database') || error?.name?.includes('Mongo');
    return NextResponse.json({ success: false, error: isDbUnavailable ? 'Database service unavailable' : (error.message || 'Internal server error') }, { status: isDbUnavailable ? 503 : 500 });
  }
}
