import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saikatahmmad77_db_user:hHZtpivoSZ0sGoOs@cluster0.edizqnd.mongodb.net/sonic_eshop?retryWrites=true&w=majority";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'saikatahmmad77@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sonic2026';

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('sonic_eshop');

  console.log('[Seed] Connected! Setting up collections and indexes...');

  // Ensure collections
  const collections = ['settings', 'games', 'coupons', 'orders', 'users', 'sessions', 'auditLogs', 'walletTransactions'];
  const existingCols = (await db.listCollections().toArray()).map(c => c.name);
  for (const col of collections) {
    if (!existingCols.includes(col)) {
      await db.createCollection(col);
      console.log(`- Created collection: ${col}`);
    }
  }

  // Create Indexes
  console.log('[Seed] Ensuring indexes...');
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ phone: 1 }, { sparse: true });

  await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  await db.collection('games').createIndex({ id: 1 }, { unique: true });
  await db.collection('games').createIndex({ slug: 1 }, { unique: true });
  await db.collection('games').createIndex({ active: 1 });

  await db.collection('coupons').createIndex({ id: 1 }, { unique: true });
  await db.collection('coupons').createIndex({ code: 1 }, { unique: true });

  await db.collection('orders').createIndex({ id: 1 }, { unique: true });
  await db.collection('orders').createIndex({ userId: 1 });
  await db.collection('orders').createIndex({ senderLastDigits: 1 });
  await db.collection('orders').createIndex({ status: 1 });
  await db.collection('orders').createIndex({ timestamp: -1 });

  await db.collection('walletTransactions').createIndex({ id: 1 }, { unique: true });
  await db.collection('walletTransactions').createIndex({ userId: 1 });
  await db.collection('walletTransactions').createIndex({ timestamp: -1 });

  await db.collection('auditLogs').createIndex({ timestamp: -1 });

  // Load existing store.json if available
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  let store = {};
  if (fs.existsSync(storePath)) {
    store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  }

  // 1. Settings & Trust Badges
  console.log('[Seed] Seeding settings & trust badges...');
  const currentSettings = await db.collection('settings').findOne({ _id: 'main' });
  if (!currentSettings) {
    await db.collection('settings').updateOne(
      { _id: 'main' },
      {
        $set: {
          settings: store.settings || {
            siteName: "Sonic's E-Shop",
            logo: "/logo.png",
            tickerText: "⚡ Delivery Time 1-10 Minutes • 100% Safe Top-Up Guarantee",
            heroBanner: "/banner.webp",
            heroTitle: "SONIC'S E-SHOP",
            heroSubtitle: "Game Top-Up & Digital Goods BD",
            supportPhone: "01733185830",
            whatsappUrl: "https://wa.me/8801733185830",
            facebookUrl: "https://facebook.com",
            bkashNumber: "01733185830",
            nagadNumber: "01733185830",
            slides: store.settings?.slides || []
          },
          trustBadges: store.trustBadges || []
        }
      },
      { upsert: true }
    );
  }

  // 2. Games
  console.log('[Seed] Seeding games...');
  if (store.games && store.games.length > 0) {
    for (const g of store.games) {
      const doc = { ...g, active: g.active ?? true, isArchived: false };
      delete doc._id;
      await db.collection('games').updateOne({ id: g.id }, { $set: doc }, { upsert: true });
    }
  }

  // 3. Coupons
  console.log('[Seed] Seeding coupons...');
  if (store.coupons && store.coupons.length > 0) {
    for (const c of store.coupons) {
      const doc = { ...c, usageCount: c.usageCount || 0, maxUsage: c.maxUsage || 1000 };
      delete doc._id;
      await db.collection('coupons').updateOne({ id: c.id }, { $set: doc }, { upsert: true });
    }
  }

  // 4. Super Admin
  console.log(`[Seed] Ensuring Super Admin account (${ADMIN_EMAIL})...`);
  const existingAdmin = await db.collection('users').findOne({ email: ADMIN_EMAIL.toLowerCase() });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  if (!existingAdmin) {
    await db.collection('users').insertOne({
      id: 'usr-admin-super',
      name: 'Sonic Super Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'super_admin',
      walletBalance: 25000,
      createdAt: Date.now(),
      status: 'active'
    });
    console.log(`[Seed] Super Admin created: ${ADMIN_EMAIL} with role super_admin`);
  } else {
    await db.collection('users').updateOne(
      { email: ADMIN_EMAIL.toLowerCase() },
      {
        $set: {
          role: 'super_admin',
          password: existingAdmin.password || hashedPassword,
          status: 'active'
        }
      }
    );
    console.log(`[Seed] Existing Admin updated to super_admin: ${ADMIN_EMAIL}`);
  }

  console.log('[Seed] Database successfully seeded!');
  await client.close();
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
