import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { ChangePasswordSchema } from '@/lib/validations';
import { getMongoDb, recordAuditLog, logDbError } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const db = await getMongoDb();
    if (!db) {
      logDbError('POST /api/auth/change-password');
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const userWithPass = await db.collection('users').findOne({ id: currentUser.id });
    if (!userWithPass) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (userWithPass.password) {
      const isMatch = await verifyPassword(currentPassword, userWithPass.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
      }
    }

    const hashedNew = await hashPassword(newPassword);
    await db.collection('users').updateOne(
      { id: currentUser.id },
      { $set: { password: hashedNew, updatedAt: new Date().toISOString() } }
    );

    await recordAuditLog({
      action: 'update',
      entity: 'admin_security',
      entityId: currentUser.id,
      author: currentUser.name || currentUser.email || 'Admin',
      details: 'Password was updated successfully.',
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully!' });
  } catch (error: any) {
    logDbError('POST /api/auth/change-password exception', error);
    const isDbUnavailable = error?.message?.includes('Database') || error?.name?.includes('Mongo');
    return NextResponse.json({ success: false, error: isDbUnavailable ? 'Database service unavailable' : (error.message || 'Failed to update password') }, { status: isDbUnavailable ? 503 : 500 });
  }
}
