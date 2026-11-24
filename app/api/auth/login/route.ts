import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db';
import { LoginSchema } from '@/lib/validations';
import { verifyPassword, createSessionToken, checkRateLimit, COOKIE_NAME } from '@/lib/auth';
import { UserProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Please provide email/phone and password' },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const clean = identifier.trim();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    // Match by email (case-insensitive) or by phone
    const user = await db.collection<UserProfile & { password?: string }>('users').findOne({
      $or: [
        { email: { $regex: new RegExp(`^${clean}$`, 'i') } },
        { phone: clean },
        { phone: clean.replace(/\D/g, '') },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'This account has been suspended or banned. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'This account was created with Google. Please use Google Sign-In.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { lastLoginAt: new Date().toISOString() } }
    );

    const safeUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      walletBalance: user.walletBalance || 0,
      status: user.status || 'active',
      ordersCount: user.ordersCount || 0,
      createdAt: user.createdAt,
      lastLoginAt: new Date().toISOString(),
    };

    const token = await createSessionToken({
      userId: safeUser.id,
      role: safeUser.role,
      email: safeUser.email,
      phone: safeUser.phone,
      name: safeUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      role: safeUser.role,
      message: 'Logged in successfully',
    });

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
    console.error('[API] /api/auth/login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
