import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the MongoClient is not repeated
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri || !clientPromise) {
    return null;
  }
  try {
    return await clientPromise;
  } catch (err) {
    console.warn('[MongoDB] Connection failed, falling back to local file store:', err);
    return null;
  }
}

export async function isMongoConnected(): Promise<boolean> {
  if (!uri) return false;
  try {
    const c = await getMongoClient();
    if (!c) return false;
    await c.db().command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
