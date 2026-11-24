import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db';
import { RegisterSchema } from '@/lib/validations';
import { hashPassword, createSessionToken, checkRateLimit, COOKIE_NAME } from '@/lib/auth';
import { UserProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    // Check unique email (case-insensitive)
    const existingEmail = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Check unique phone
    const existingPhone = await db.collection('users').findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'An account with this phone number already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userId = `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Strictly enforce role="user" on server side. Any role passed from client is IGNORED!
    const newUser: UserProfile & { password?: string } = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: 'user', // Forced to user
      walletBalance: 100, // ৳100 Welcome Bonus
      status: 'active',
      ordersCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      password: hashedPassword,
    };

    await db.collection('users').insertOne(newUser);

    // Record welcome bonus in wallet transactions
    await db.collection('walletTransactions').insertOne({
      id: `wtx-${Date.now()}`,
      userId,
      type: 'welcome_bonus',
      amount: 100,
      balanceAfter: 100,
      description: 'Welcome Bonus Credit',
      createdAt: new Date().toISOString(),
    });

    const safeUser: UserProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      walletBalance: newUser.walletBalance,
      status: newUser.status,
      ordersCount: 0,
      createdAt: newUser.createdAt,
    };

    // Issue httpOnly session token
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
      message: 'Account created successfully with ৳100 Welcome Bonus!',
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
    console.error('[API] /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
