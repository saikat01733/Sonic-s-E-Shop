import fs from 'fs';
import path from 'path';
import { StoreData, SiteSettings, GameItem, PackageItem, CouponItem, OrderItem, AuditLogItem, UserProfile } from './types';
import { getMongoClient } from './mongodb';

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

// Read file store safely
export function readFileStore(): StoreData {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const defaultStore: StoreData = {
        settings: {
          siteName: "Sonic's E-Shop",
          logo: "/logo.png",
          tickerText: "⚡ ডেলিভারি সময় ১-১০ মিনিট • ১০০% নিরাপদ টপ-আপ গ্যারান্টি",
          heroBanner: "/banner.webp",
          heroTitle: "SONIC'S E-SHOP",
          heroSubtitle: "Game Top-Up & Digital Goods BD",
          supportPhone: "01733185830",
          whatsappUrl: "https://wa.me/8801733185830",
          facebookUrl: "https://facebook.com",
          bkashNumber: "01733185830",
          nagadNumber: "01733185830",
          adminPin: "sonic2026"
        },
        trustBadges: [],
        games: [],
        coupons: [],
        orders: [],
        auditLogs: []
      };
      fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
      fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore, null, 2), 'utf-8');
      return defaultStore;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading store file:', err);
    throw err;
  }
}

// Write to file store atomically
export function writeFileStore(data: StoreData) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    const tempPath = `${STORE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error('[DB] Error writing store file:', err);
    throw err;
  }
}

// Helper to format date in Bengali style
function getFormattedDate(): string {
  return new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Unified Get Store Data (Checks MongoDB first, falls back to file store)
export async function getStoreData(): Promise<StoreData> {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      const db = mongo.db();
      const settingsDoc = await db.collection('settings').findOne({ _id: 'main' as any });
      const games = await db.collection<GameItem>('games').find({}).toArray();
      const coupons = await db.collection<CouponItem>('coupons').find({}).toArray();
      const orders = await db.collection<OrderItem>('orders').find({}).sort({ timestamp: -1 }).toArray();
      const auditLogs = await db.collection<AuditLogItem>('auditLogs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      const users = await db.collection<UserProfile>('users').find({}).sort({ createdAt: -1 }).toArray();

      if (settingsDoc && games.length > 0) {
        const local = readFileStore();
        const mergedSettings: SiteSettings = {
          ...local.settings,
          ...settingsDoc.settings,
          slides: settingsDoc.settings?.slides?.length ? settingsDoc.settings.slides : local.settings.slides,
        };
        return {
          settings: mergedSettings,
          trustBadges: settingsDoc.trustBadges?.length ? settingsDoc.trustBadges : local.trustBadges || [],
          games,
          coupons,
          orders,
          auditLogs,
          users: users?.length ? users : (local.users || [])
        };
      } else if (games.length === 0) {
        // Auto-seed initial store data into MongoDB Atlas
        const local = readFileStore();
        await db.collection('settings').updateOne(
          { _id: 'main' as any },
          { $set: { settings: local.settings, trustBadges: local.trustBadges } },
          { upsert: true }
        );
        if (local.games && local.games.length > 0) {
          await db.collection('games').insertMany(local.games as any);
        }
        if (local.coupons && local.coupons.length > 0) {
          await db.collection('coupons').insertMany(local.coupons as any);
        }
        if (local.orders && local.orders.length > 0) {
          await db.collection('orders').insertMany(local.orders as any);
        }
        if (local.auditLogs && local.auditLogs.length > 0) {
          await db.collection('auditLogs').insertMany(local.auditLogs as any);
        }
        console.log('[MongoDB] Successfully seeded initial store data to Atlas collections!');
        return local;
      }
    } catch (e) {
      console.warn('[MongoDB] Query failed, using file store:', e);
    }
  }

  return readFileStore();
}

// Add Audit Log
export async function addAuditLog(
  action: AuditLogItem['action'],
  entity: string,
  details: string,
  author: string = 'admin'
): Promise<AuditLogItem> {
  const entry: AuditLogItem = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    entity,
    details,
    author,
    timestamp: Date.now(),
    dateStr: getFormattedDate()
  };

  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('auditLogs').insertOne(entry as any);
    } catch (e) {
      console.warn('[MongoDB] Failed to log audit, fallback to file:', e);
    }
  }

  const store = readFileStore();
  store.auditLogs = store.auditLogs || [];
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 300) {
    store.auditLogs = store.auditLogs.slice(0, 300);
  }
  writeFileStore(store);

  return entry;
}

// Update Site Settings & Trust Badges
export async function updateSiteSettings(settings: Partial<SiteSettings>, trustBadges?: any[], author: string = 'admin') {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('settings').updateOne(
        { _id: 'main' as any },
        { $set: { settings, ...(trustBadges ? { trustBadges } : {}) } },
        { upsert: true }
      );
    } catch (e) {
      console.warn('[MongoDB] Update settings failed, using file:', e);
    }
  }

  const store = readFileStore();
  store.settings = { ...store.settings, ...settings };
  if (trustBadges) {
    store.trustBadges = trustBadges;
  }
  writeFileStore(store);

  await addAuditLog('UPDATED', 'Site Settings & CMS', 'Updated site branding, ticker or payment numbers', author);
  return store;
}

// Save or Update Game
export async function saveGame(game: GameItem, author: string = 'admin'): Promise<GameItem> {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      const docToSave = { ...game };
      delete (docToSave as any)._id;
      await mongo.db().collection('games').updateOne(
        { id: game.id } as any,
        { $set: docToSave },
        { upsert: true }
      );
    } catch (e) {
      console.warn('[MongoDB] saveGame failed:', e);
    }
  }

  const store = readFileStore();
  const index = store.games.findIndex(g => g.id === game.id);
  const isNew = index === -1;
  if (isNew) {
    store.games.push(game);
  } else {
    store.games[index] = game;
  }
  writeFileStore(store);

  await addAuditLog(
    isNew ? 'CREATED' : 'UPDATED',
    `Game: ${game.name}`,
    `${isNew ? 'Created new game entry' : 'Updated game configuration and packages'}`,
    author
  );
  return game;
}

// Delete Game
export async function deleteGame(gameId: string, author: string = 'admin'): Promise<boolean> {
  const store = readFileStore();
  const game = store.games.find(g => g.id === gameId);
  const gameName = game ? game.name : gameId;

  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('games').deleteOne({ id: gameId } as any);
    } catch (e) {
      console.warn('[MongoDB] deleteGame failed:', e);
    }
  }

  store.games = store.games.filter(g => g.id !== gameId);
  writeFileStore(store);

  await addAuditLog('DELETED', `Game: ${gameName}`, `Deleted game with ID ${gameId}`, author);
  return true;
}

// Save or Update Package
export async function savePackage(gameId: string, pkg: PackageItem, author: string = 'admin'): Promise<PackageItem> {
  const mongo = await getMongoClient();
  let game: GameItem | null = null;
  if (mongo) {
    try {
      game = await mongo.db().collection<GameItem>('games').findOne({ id: gameId } as any);
    } catch (e) {}
  }
  if (!game) {
    const store = readFileStore();
    game = store.games.find(g => g.id === gameId) || null;
  }
  if (!game) throw new Error('Game not found');

  if (!game.packages) game.packages = [];
  const pIndex = game.packages.findIndex(p => p.id === pkg.id);
  const isNew = pIndex === -1;
  if (isNew) {
    game.packages.push(pkg);
  } else {
    game.packages[pIndex] = pkg;
  }

  await saveGame(game, author);
  await addAuditLog(
    isNew ? 'CREATED' : 'UPDATED',
    `Package: ${pkg.name} (${game.name})`,
    `${isNew ? 'Added package' : 'Updated package price or stock status'}: ৳${pkg.price} (${pkg.stock ? 'In Stock' : 'Out of Stock'})`,
    author
  );
  return pkg;
}

// Delete Package
export async function deletePackage(gameId: string, pkgId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getMongoClient();
  let game: GameItem | null = null;
  if (mongo) {
    try {
      game = await mongo.db().collection<GameItem>('games').findOne({ id: gameId } as any);
    } catch (e) {}
  }
  if (!game) {
    const store = readFileStore();
    game = store.games.find(g => g.id === gameId) || null;
  }
  if (!game) throw new Error('Game not found');

  if (!game.packages) game.packages = [];
  const pkg = game.packages.find(p => p.id === pkgId);
  const pkgName = pkg ? pkg.name : pkgId;

  game.packages = game.packages.filter(p => p.id !== pkgId);
  await saveGame(game, author);

  await addAuditLog('DELETED', `Package: ${pkgName} (${game.name})`, `Deleted package ${pkgId}`, author);
  return true;
}

// Save or Update Coupon
export async function saveCoupon(coupon: CouponItem, author: string = 'admin'): Promise<CouponItem> {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      const docToSave = { ...coupon };
      delete (docToSave as any)._id;
      await mongo.db().collection('coupons').updateOne(
        { id: coupon.id } as any,
        { $set: docToSave },
        { upsert: true }
      );
    } catch (e) {
      console.warn('[MongoDB] saveCoupon failed:', e);
    }
  }

  const store = readFileStore();
  const index = store.coupons.findIndex(c => c.id === coupon.id);
  const isNew = index === -1;
  if (isNew) {
    store.coupons.push(coupon);
  } else {
    store.coupons[index] = coupon;
  }
  writeFileStore(store);

  await addAuditLog(
    isNew ? 'CREATED' : 'UPDATED',
    `Coupon: ${coupon.code}`,
    `${isNew ? 'Created promo voucher' : 'Updated coupon details'}: ৳${coupon.discount} discount, min spend ৳${coupon.minSpend}`,
    author
  );
  return coupon;
}

// Delete Coupon
export async function deleteCoupon(couponId: string, author: string = 'admin'): Promise<boolean> {
  const store = readFileStore();
  const coupon = store.coupons.find(c => c.id === couponId);
  const code = coupon ? coupon.code : couponId;

  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('coupons').deleteOne({ id: couponId } as any);
    } catch (e) {
      console.warn('[MongoDB] deleteCoupon failed:', e);
    }
  }

  store.coupons = store.coupons.filter(c => c.id !== couponId);
  writeFileStore(store);

  await addAuditLog('DELETED', `Coupon: ${code}`, `Deleted coupon with ID ${couponId}`, author);
  return true;
}

// Create Customer Order
export async function createOrder(order: OrderItem): Promise<OrderItem> {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('orders').insertOne(order as any);
    } catch (e) {
      console.warn('[MongoDB] createOrder failed:', e);
    }
  }

  const store = readFileStore();
  store.orders = store.orders || [];
  store.orders.unshift(order);
  writeFileStore(store);

  await addAuditLog(
    'CREATED',
    `Order: ${order.id}`,
    `New order submitted for ${order.gameName} (৳${order.totalAmount}) via ${order.paymentMethod}`,
    'Customer'
  );
  return order;
}

// Update Order Status
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderItem['status'],
  author: string = 'admin'
): Promise<OrderItem> {
  const store = readFileStore();
  const order = store.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');

  const oldStatus = order.status;
  order.status = newStatus;

  const mongo = await getMongoClient();
  if (mongo) {
    try {
      await mongo.db().collection('orders').updateOne(
        { id: orderId } as any,
        { $set: { status: newStatus } }
      );
    } catch (e) {
      console.warn('[MongoDB] updateOrderStatus failed:', e);
    }
  }

  writeFileStore(store);

  await addAuditLog(
    'STATUS_CHANGE',
    `Order: ${order.id}`,
    `Status updated from ${oldStatus} to ${newStatus}`,
    author
  );
  return order;
}

// ==========================================
// USER DATABASE & RBAC PERSISTENCE
// ==========================================

export async function getUsers(): Promise<UserProfile[]> {
  const mongo = await getMongoClient();
  if (mongo) {
    try {
      const users = await mongo.db().collection<UserProfile>('users').find({}).sort({ createdAt: -1 }).toArray();
      if (users && users.length > 0) return users;
    } catch (e) {
      console.warn('[MongoDB] getUsers failed:', e);
    }
  }
  const store = readFileStore();
  return store.users || [];
}

export async function syncUser(user: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
  const mongo = await getMongoClient();
  const store = readFileStore();
  if (!store.users) store.users = [];

  const existingLocal = store.users.find(
    u => u.id === user.id || (user.email && u.email === user.email) || (user.phone && u.phone === user.phone)
  );

  let finalUser: UserProfile = {
    id: user.id,
    name: user.name || existingLocal?.name || 'Gamer User',
    email: user.email || existingLocal?.email,
    phone: user.phone || existingLocal?.phone,
    avatar: user.avatar || existingLocal?.avatar,
    role: existingLocal?.role === 'admin' ? 'admin' : (user.role || 'user'),
    walletBalance: existingLocal ? existingLocal.walletBalance : (user.walletBalance ?? 100),
    createdAt: existingLocal?.createdAt || Date.now(),
  };

  if (mongo) {
    try {
      const collection = mongo.db().collection<UserProfile>('users');
      const orClauses: any[] = [{ id: user.id }];
      if (user.email) orClauses.push({ email: user.email });
      if (user.phone) orClauses.push({ phone: user.phone });

      const existingMongo = await collection.findOne({ $or: orClauses } as any);

      if (existingMongo) {
        finalUser.id = existingMongo.id || finalUser.id;
        finalUser.role = existingMongo.role || finalUser.role;
        finalUser.walletBalance = typeof existingMongo.walletBalance === 'number' ? existingMongo.walletBalance : finalUser.walletBalance;
        finalUser.name = user.name || existingMongo.name || finalUser.name;
        finalUser.avatar = user.avatar || existingMongo.avatar || finalUser.avatar;
      }

      const docToSave = { ...finalUser };
      delete (docToSave as any)._id;

      const filter = existingMongo ? { _id: existingMongo._id } : { id: finalUser.id };
      await collection.updateOne(
        filter as any,
        { $set: docToSave },
        { upsert: true }
      );
    } catch (e) {
      console.warn('[MongoDB] syncUser failed:', e);
    }
  }

  const localIdx = store.users.findIndex(u => u.id === finalUser.id || (finalUser.email && u.email === finalUser.email));
  if (localIdx >= 0) {
    store.users[localIdx] = finalUser;
  } else {
    store.users.push(finalUser);
  }
  writeFileStore(store);

  return finalUser;
}

export async function updateUser(
  userId: string,
  updates: Partial<UserProfile>,
  author: string = 'Admin'
): Promise<UserProfile | null> {
  const mongo = await getMongoClient();
  const store = readFileStore();
  if (!store.users) store.users = [];

  const localIdx = store.users.findIndex(u => u.id === userId);
  let user: UserProfile | null = localIdx >= 0 ? { ...store.users[localIdx], ...updates } : null;

  if (mongo) {
    try {
      const collection = mongo.db().collection<UserProfile>('users');
      if (!user) {
        const found = await collection.findOne({ id: userId } as any);
        if (found) user = { ...found, ...updates };
      }
      if (user) {
        const docToSave = { ...updates };
        delete (docToSave as any)._id;
        await collection.updateOne(
          { id: userId } as any,
          { $set: docToSave },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('[MongoDB] updateUser failed:', e);
    }
  }

  if (user) {
    if (localIdx >= 0) {
      store.users[localIdx] = user;
    } else {
      store.users.push(user);
    }
    writeFileStore(store);

    await addAuditLog(
      'UPDATED',
      `User: ${user.name} (${user.role.toUpperCase()})`,
      `Updated user profile: Role=${user.role}, Wallet=৳${user.walletBalance}`,
      author
    );
  }

  return user;
}
