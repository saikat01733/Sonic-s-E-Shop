import { MongoClient, Db } from 'mongodb';

export type MongoErrorCategory = 'missing-env' | 'auth' | 'network' | 'timeout' | 'unknown';

export interface MongoErrorInfo {
  name: string;
  message: string;
  code?: string | number;
  category: MongoErrorCategory;
  timestamp: string;
}

interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient | null> | null;
  lastError: MongoErrorInfo | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: MongoCache | undefined;
}

const cached: MongoCache = globalThis._mongoCache || {
  client: null,
  promise: null,
  lastError: null,
};
globalThis._mongoCache = cached;

/**
 * Categorize MongoDB error without leaking sensitive connection details
 */
export function categorizeMongoError(err: any): MongoErrorCategory {
  if (!err) return 'unknown';
  const name = String(err.name || '');
  const message = String(err.message || '');
  const code = String(err.code || '');

  if (name === 'MissingEnvError' || message.includes('MONGODB_URI')) {
    return 'missing-env';
  }
  if (
    name === 'MongoServerError' &&
    (code === '18' || code === 'AuthenticationFailed' || message.includes('Authentication failed') || message.includes('auth failed'))
  ) {
    return 'auth';
  }
  if (
    name === 'MongoServerSelectionError' ||
    message.includes('Server selection timed out') ||
    message.includes('selection timed out') ||
    name === 'TimeoutError'
  ) {
    return 'timeout';
  }
  if (
    name === 'MongoNetworkError' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ETIMEDOUT' ||
    message.includes('ENOTFOUND') ||
    message.includes('getaddrinfo') ||
    message.includes('failed to connect')
  ) {
    return 'network';
  }
  return 'unknown';
}

/**
 * Structured server-side error logger that logs real underlying error (name, message, code)
 * to server logs while keeping URI and credentials completely private.
 */
export function logDbError(context: string, err?: any) {
  const targetErr = err || cached.lastError;
  const category = targetErr?.category || categorizeMongoError(targetErr);
  const errorName = targetErr?.name || 'DatabaseUnavailable';
  const message = targetErr?.message || 'Database connection could not be established';
  const code = targetErr?.code || (targetErr as any)?.codeName || 'DB_UNAVAILABLE';

  console.error(`[MongoDB Error] [${context}]`, JSON.stringify({
    context,
    category,
    name: errorName,
    message,
    code,
    timestamp: new Date().toISOString(),
  }));
}

export function getMongoLastError(): MongoErrorInfo | null {
  return cached.lastError;
}

/**
 * Serverless-optimized MongoDB connection resolver with global connection pooling,
 * explicit 8000ms timeouts, and automatic retry-on-failure promise reset.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorInfo: MongoErrorInfo = {
      name: 'MissingEnvError',
      message: 'MONGODB_URI environment variable is missing or empty',
      code: 'MISSING_ENV',
      category: 'missing-env',
      timestamp: new Date().toISOString(),
    };
    cached.lastError = errorInfo;
    console.error('[MongoDB Error]', JSON.stringify(errorInfo));
    return null;
  }

  // Reuse active connected client
  if (cached.client) {
    return cached.client;
  }

  // Create new connection if no promise currently active
  if (!cached.promise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 5,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
    });

    cached.promise = client
      .connect()
      .then((c) => {
        cached.client = c;
        cached.lastError = null;
        return c;
      })
      .catch((err) => {
        // Clear cached promise on rejection so subsequent serverless invocations can retry fresh
        cached.promise = null;
        cached.client = null;

        const category = categorizeMongoError(err);
        const errorInfo: MongoErrorInfo = {
          name: err?.name || 'MongoConnectionError',
          message: err?.message || 'Failed to connect to MongoDB cluster',
          code: (err as any)?.code || (err as any)?.codeName || 'CONNECT_FAIL',
          category,
          timestamp: new Date().toISOString(),
        };
        cached.lastError = errorInfo;
        console.error('[MongoDB Connection Failure]', JSON.stringify(errorInfo));
        return null;
      });
  }

  return cached.promise;
}

/**
 * Returns the default Db instance or a named Db instance
 */
export async function getMongoDb(dbName?: string): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  const targetDb = dbName || process.env.MONGODB_DB || 'sonic_eshop';
  return client.db(targetDb);
}

/**
 * Ping MongoDB to verify cluster connectivity
 */
export async function isMongoConnected(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    if (!client) return false;
    await client.db().command({ ping: 1 });
    return true;
  } catch (err: any) {
    const category = categorizeMongoError(err);
    console.error('[MongoDB Ping Failure]', {
      name: err?.name,
      category,
      message: err?.message,
      code: err?.code,
    });
    return false;
  }
}
