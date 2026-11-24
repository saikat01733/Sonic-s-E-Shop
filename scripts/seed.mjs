import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saikatahmmad77_db_user:hHZtpivoSZ0sGoOs@cluster0.edizqnd.mongodb.net/sonic_eshop?retryWrites=true&w=majority";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'saikatahmmad77@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sonic2026';

const DEFAULT_SLIDES = [
  {
    id: "slide-efootball",
    gameId: "efootball",
    slug: "efootball-coin",
    title: "eFootball™ 2026 Coins",
    subtitle: "Official Konami In-Game Coins with exclusive bonus packs & 100% guarantee.",
    badge: "HOT TOP-UP",
    deliveryTime: "1-10 MINS",
    image: "/assets/efootball.jpg",
    color: "#0284c7"
  },
  {
    id: "slide-pubg",
    gameId: "pubg",
    slug: "pubg-mobile-uc",
    title: "PUBG Mobile Unknown Cash",
    subtitle: "Instant direct Player ID (UID) delivery with Royal Pass & Lucky Spin UC packs.",
    badge: "INSTANT DELIVERY",
    deliveryTime: "1-5 MINS",
    image: "/assets/pubg.jpg",
    color: "#0284c7"
  },
  {
    id: "slide-roblox",
    gameId: "roblox",
    slug: "roblox-robux",
    title: "Roblox Robux VIP Top-Up",
    subtitle: "Safe in-game Robux delivery via username with zero account risk or password required.",
    badge: "100% SAFE",
    deliveryTime: "5-15 MINS",
    image: "/assets/roblox.jpg",
    color: "#06b6d4"
  }
];

const DEFAULT_SETTINGS = {
  siteName: "Sonic's E-Shop",
  logo: "/logo.png",
  tickerText: "⚡ ডেলিভারি সময় ১-১০ মিনিট • ১০০% নিরাপদ টপ-আপ গ্যারান্টি • bKash ও Nagad পার্সোনাল সেন্ড মানি • যেকোনো সমস্যায় WhatsApp: 01733185830",
  heroBanner: "/banner.webp",
  heroTitle: "SONIC'S E-SHOP",
  heroSubtitle: "Game Top-Up & Digital Goods BD",
  supportPhone: "01733185830",
  whatsappUrl: "https://wa.me/8801733185830",
  facebookUrl: "https://facebook.com",
  bkashNumber: "01733185830",
  nagadNumber: "01733185830",
  slides: DEFAULT_SLIDES
};

const DEFAULT_BADGES = [
  { id: "badge-1", title: "১০০% সেফ পেমেন্ট", subtitle: "BKash & Nagad ভেরিফাইড", icon: "ShieldCheck" },
  { id: "badge-2", title: "ফাস্ট ডেলিভারি", subtitle: "১-১০ মিনিট সময়", icon: "Zap" },
  { id: "badge-3", title: "২৪/৭ সাপোর্ট", subtitle: "ডেডিকেটেড হেল্পলাইন", icon: "Headphones" },
  { id: "badge-4", title: "১ লাখ+ গ্রাহক", subtitle: "সন্তুষ্ট গেমার পরিবার", icon: "Users" }
];

const DEFAULT_GAMES = [
  {
    id: "efootball",
    name: "eFootball™ Coins",
    category: "Mobile",
    publisher: "Konami",
    slug: "efootball-coin",
    image: "/assets/efootball.jpg",
    description: "Official Konami eFootball 2026 Coins top up for Android and iOS devices. Safe, fast, and delivered within 1-10 minutes.",
    active: true,
    isArchived: false,
    rating: 4.9,
    deliveryTime: "1-10 মিনিট",
    badge: "HOT DEAL",
    fields: [
      { id: "konami_id", label: "Konami ID / Email", type: "email", placeholder: "example@gmail.com", required: true },
      { id: "username", label: "In-Game Username", type: "text", placeholder: "Your game name", required: true },
      { id: "account_type", label: "Account Type", type: "select", options: ["Google Play", "Apple ID", "Konami ID"], required: true },
      { id: "password", label: "Account Password", type: "password", placeholder: "Account login password", required: true }
    ],
    packages: [
      { id: "ef-1", name: "130 Coins", price: 120, stock: true },
      { id: "ef-2", name: "260 Coins", price: 240, stock: true },
      { id: "ef-3", name: "390 Coins", price: 360, stock: true },
      { id: "ef-4", name: "520 Coins", price: 470, stock: true },
      { id: "ef-5", name: "700 Coins", price: 620, stock: true },
      { id: "ef-6", name: "1050 Coins", price: 920, stock: true },
      { id: "ef-7", name: "2130 Coins", price: 1820, stock: true },
      { id: "ef-8", name: "3250 Coins", price: 2750, stock: true },
      { id: "ef-9", name: "5700 Coins", price: 4700, stock: true },
      { id: "ef-10", name: "12800 Coins", price: 9800, stock: true }
    ]
  },
  {
    id: "pubg",
    name: "PUBG Mobile UC",
    category: "Mobile",
    publisher: "Tencent Games / Level Infinite",
    slug: "pubg-mobile-uc",
    image: "/assets/pubg.jpg",
    description: "Official PUBG Mobile Unknown Cash (UC) top-up via Player ID. 100% automated instant delivery to your account within 1-5 minutes.",
    active: true,
    isArchived: false,
    rating: 4.9,
    deliveryTime: "১-৫ মিনিট",
    badge: "INSTANT UID",
    fields: [
      { id: "player_id", label: "Player ID (UID)", type: "text", placeholder: "e.g. 5123456789", required: true },
      { id: "character_name", label: "Character Name", type: "text", placeholder: "e.g. Victor_BD", required: false }
    ],
    packages: [
      { id: "pubg-1", name: "60 UC", price: 95, stock: true },
      { id: "pubg-2", name: "325 UC", price: 470, stock: true },
      { id: "pubg-3", name: "660 UC", price: 920, stock: true },
      { id: "pubg-4", name: "1800 UC", price: 2350, stock: true },
      { id: "pubg-5", name: "3850 UC", price: 4650, stock: true },
      { id: "pubg-6", name: "8100 UC", price: 9200, stock: true }
    ]
  },
  {
    id: "roblox",
    name: "Roblox Robux",
    category: "PC & Mobile",
    publisher: "Roblox Corporation",
    slug: "roblox-robux",
    image: "/assets/roblox.jpg",
    description: "Official Roblox Robux top-up for your avatar, skins, and game passes. Enter your Roblox username to receive Robux safely.",
    active: true,
    isArchived: false,
    rating: 4.8,
    deliveryTime: "৫-১৫ মিনিট",
    badge: "POPULAR",
    fields: [
      { id: "roblox_username", label: "Roblox Username", type: "text", placeholder: "e.g. RobloxGamer2026", required: true }
    ],
    packages: [
      { id: "rb-1", name: "80 Robux", price: 110, stock: true },
      { id: "rb-2", name: "400 Robux", price: 520, stock: true },
      { id: "rb-3", name: "800 Robux", price: 990, stock: true },
      { id: "rb-4", name: "1700 Robux", price: 2050, stock: true },
      { id: "rb-5", name: "4500 Robux", price: 4950, stock: true }
    ]
  }
];

const DEFAULT_COUPONS = [
  {
    id: "c-1",
    code: "SONIC10",
    discount: 10,
    minSpend: 100,
    description: "৳১০০ বা তার বেশি যেকোনো গেম টপ-আপে পান ১০ টাকা ইনস্ট্যান্ট ডিসকাউন্ট।",
    active: true,
    usageCount: 0,
    maxUsage: 1000
  },
  {
    id: "c-2",
    code: "EFOOTBALL",
    discount: 20,
    minSpend: 300,
    description: "ই-ফুটবল কয়েন অর্ডারে পাবেন ২০ টাকা ক্যাশব্যাক ইনস্ট্যান্ট ভাউচার ডিসকাউন্ট।",
    active: true,
    usageCount: 0,
    maxUsage: 1000
  },
  {
    id: "c-3",
    code: "KHELA",
    discount: 15,
    minSpend: 200,
    description: "যেকোনো গেম টপ-আপে ২০০ টাকা বা তার বেশি অর্ডারে প্রযোজ্য ১৫ টাকা ইনস্ট্যান্ট ছাড়।",
    active: true,
    usageCount: 0,
    maxUsage: 1000
  }
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  await client.connect();
  const db = client.db('sonic_eshop');

  console.log('[Seed] Connected! Ensuring collections and indexes...');

  // 1. Ensure Collections
  const collections = ['settings', 'games', 'coupons', 'orders', 'users', 'sessions', 'auditLogs', 'walletTransactions'];
  const existingCols = (await db.listCollections().toArray()).map(c => c.name);
  for (const col of collections) {
    if (!existingCols.includes(col)) {
      await db.createCollection(col);
      console.log(`- Created collection: ${col}`);
    }
  }

  // 2. Ensure Indexes
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
  await db.collection('orders').createIndex({ status: 1 });
  await db.collection('orders').createIndex({ timestamp: -1 });

  await db.collection('walletTransactions').createIndex({ id: 1 }, { unique: true });
  await db.collection('walletTransactions').createIndex({ userId: 1 });
  await db.collection('walletTransactions').createIndex({ timestamp: -1 });

  await db.collection('auditLogs').createIndex({ timestamp: -1 });

  // 3. Load existing store.json if available
  let fileData = {};
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  if (fs.existsSync(storePath)) {
    try {
      fileData = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    } catch (e) {
      console.warn('[Seed] Note: Could not parse local store.json, using defaults:', e.message);
    }
  }

  // 4. Seed Settings & Trust Badges
  console.log('[Seed] Seeding site settings & trust badges...');
  const currentSettings = await db.collection('settings').findOne({ _id: 'main' });
  const settingsToSave = currentSettings?.settings || fileData.settings || DEFAULT_SETTINGS;
  const badgesToSave = currentSettings?.trustBadges || fileData.trustBadges || DEFAULT_BADGES;

  await db.collection('settings').updateOne(
    { _id: 'main' },
    {
      $set: {
        settings: settingsToSave,
        trustBadges: badgesToSave,
      }
    },
    { upsert: true }
  );

  // 5. Seed Games
  console.log('[Seed] Seeding games...');
  const gamesToSeed = (fileData.games && fileData.games.length > 0) ? fileData.games : DEFAULT_GAMES;
  for (const g of gamesToSeed) {
    const doc = { ...g, active: g.active ?? true, isArchived: false };
    delete doc._id;
    await db.collection('games').updateOne({ id: g.id }, { $set: doc }, { upsert: true });
  }

  // 6. Seed Coupons
  console.log('[Seed] Seeding coupons...');
  const couponsToSeed = (fileData.coupons && fileData.coupons.length > 0) ? fileData.coupons : DEFAULT_COUPONS;
  for (const c of couponsToSeed) {
    const doc = { ...c, usageCount: c.usageCount || 0, maxUsage: c.maxUsage || 1000 };
    delete doc._id;
    await db.collection('coupons').updateOne({ id: c.id }, { $set: doc }, { upsert: true });
  }

  // 7. Seed Super Admin
  console.log(`[Seed] Ensuring Super Admin account (${ADMIN_EMAIL})...`);
  const adminEmailClean = ADMIN_EMAIL.toLowerCase().trim();
  const existingAdmin = await db.collection('users').findOne({ email: adminEmailClean });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (!existingAdmin) {
    await db.collection('users').insertOne({
      id: 'usr-admin-super',
      name: 'Sonic Super Admin',
      email: adminEmailClean,
      password: hashedPassword,
      role: 'super_admin',
      walletBalance: 25000,
      createdAt: Date.now(),
      status: 'active'
    });
    console.log(`[Seed] Super Admin created: ${adminEmailClean} with role super_admin`);
  } else {
    await db.collection('users').updateOne(
      { email: adminEmailClean },
      {
        $set: {
          role: 'super_admin',
          password: hashedPassword,
          status: 'active'
        }
      }
    );
    console.log(`[Seed] Existing Admin updated to super_admin: ${adminEmailClean}`);
  }

  console.log('[Seed] Database successfully seeded!');
  await client.close();
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
