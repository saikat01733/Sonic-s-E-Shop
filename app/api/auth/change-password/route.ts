import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { ChangePasswordSchema } from '@/lib/validations';
import { getMongoDb, recordAuditLog } from '@/lib/db';

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
    console.error('[API] /api/auth/change-password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update password' }, { status: 500 });
  }
}
