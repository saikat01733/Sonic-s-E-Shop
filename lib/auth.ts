import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getMongoDb, logDbError } from '@/lib/db';
import { UserProfile, UserRole } from '@/lib/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sonic-eshop-production-jwt-secret-key-2026-safe-guard'
);

export const COOKIE_NAME = 'sonic_session';

export type Permission =
  | 'orders.read'
  | 'orders.update'
  | 'games.write'
  | 'coupons.write'
  | 'users.read'
  | 'users.manage'
  | 'users.manage_role'
  | 'settings.write'
  | 'audit.read'
  | 'wallet.admin_adjust';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'orders.read',
    'orders.update',
    'games.write',
    'coupons.write',
    'users.read',
    'users.manage',
    'users.manage_role',
    'settings.write',
    'audit.read',
    'wallet.admin_adjust',
  ],
  admin: [
    'orders.read',
    'orders.update',
    'games.write',
    'coupons.write',
    'users.read',
    'users.manage',
    'settings.write',
    'audit.read',
    'wallet.admin_adjust',
  ],
  staff: ['orders.read', 'orders.update'],
  user: [],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email?: string;
  phone?: string;
  name: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user from MongoDB via httpOnly cookie.
 */
export async function getCurrentUser(req?: NextRequest): Promise<UserProfile | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    const db = await getMongoDb();
    if (!db) {
      logDbError('getCurrentUser');
      return null;
    }

    const user = await db.collection<UserProfile>('users').findOne({ id: payload.userId }, { projection: { _id: 0 } });
    if (!user) return null;

    // Remove sensitive fields
    const { password: _, ...safeUser } = user as any;
    return safeUser as UserProfile;
  } catch (err) {
    console.error('[Auth] getCurrentUser error:', err);
    return null;
  }
}

/**
 * In-memory sliding window rate-limiter for sensitive auth endpoints.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Cleans up old rate limit records periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    }
  }, 120000);
}
