import { NextResponse } from 'next/server';
import { getMongoClient, getMongoLastError, categorizeMongoError } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[Health Check Failure] MONGODB_URI environment variable is missing');
      return NextResponse.json(
        {
          status: 'error',
          category: 'missing-env',
          message: 'Database configuration missing',
        },
        { status: 503 }
      );
    }

    const client = await getMongoClient();
    if (!client) {
      const lastErr = getMongoLastError();
      const category = lastErr?.category || 'unknown';
      console.error('[Health Check Failure] MongoDB client unavailable', {
        category,
        name: lastErr?.name,
        message: lastErr?.message,
        code: lastErr?.code,
      });
      return NextResponse.json(
        {
          status: 'error',
          category,
          message: 'Database service unavailable',
        },
        { status: 503 }
      );
    }

    // Ping cluster to verify live round-trip connectivity
    await client.db().command({ ping: 1 });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err: any) {
    const category = categorizeMongoError(err);
    console.error('[Health Check Exception]', {
      name: err?.name,
      category,
      message: err?.message,
      code: err?.code,
    });
    return NextResponse.json(
      {
        status: 'error',
        category,
        message: 'Database service unavailable',
      },
      { status: 503 }
    );
  }
}
