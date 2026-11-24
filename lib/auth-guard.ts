import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME, Permission, hasPermission } from '@/lib/auth';
import { UserProfile, UserRole } from '@/lib/types';
import { getMongoDb, logDbError } from '@/lib/db';

export interface AuthGuardResult {
  authorized: boolean;
  user?: UserProfile;
  errorResponse?: NextResponse;
}

/**
 * Server-side guard for API routes requiring Admin/SuperAdmin/Staff privilege
 */
export async function requireAdmin(
  req: NextRequest,
  permission?: Permission
): Promise<AuthGuardResult> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in as an admin.' },
        { status: 401 }
      ),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.userId) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please sign in again.' },
        { status: 401 }
      ),
    };
  }

  const role = payload.role;
  const isSuperOrAdmin = role === 'admin' || role === 'super_admin';
  const isAuthorizedStaff = role === 'staff' && permission && hasPermission('staff', permission);

  if (!isSuperOrAdmin && !isAuthorizedStaff) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Access denied: Admin privileges required.' },
        { status: 403 }
      ),
    };
  }

  // Fetch fresh user from DB
  const db = await getMongoDb();
  let user: UserProfile | undefined;
  if (!db) {
    logDbError('requireAdmin:getMongoDb');
  } else {
    const doc = await db.collection<UserProfile>('users').findOne({ id: payload.userId });
    if (doc) {
      if (doc.status === 'banned' || doc.status === 'suspended') {
        return {
          authorized: false,
          errorResponse: NextResponse.json(
            { success: false, error: 'Account is suspended or banned.' },
            { status: 403 }
          ),
        };
      }
      user = doc;
    }
  }

  return {
    authorized: true,
    user: user || {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      walletBalance: 0,
      status: 'active',
    },
  };
}

/**
 * Server-side guard for authenticated user API routes
 */
export async function requireUser(req: NextRequest): Promise<AuthGuardResult> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload || !payload.userId) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please sign in again.' },
        { status: 401 }
      ),
    };
  }

  const db = await getMongoDb();
  if (db) {
    const doc = await db.collection<UserProfile>('users').findOne({ id: payload.userId });
    if (doc && (doc.status === 'banned' || doc.status === 'suspended')) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'Account is suspended or banned.' },
          { status: 403 }
        ),
      };
    }
    if (doc) {
      return { authorized: true, user: doc };
    }
  }

  return {
    authorized: true,
    user: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      walletBalance: 0,
      status: 'active',
    },
  };
}
