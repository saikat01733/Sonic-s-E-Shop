import type { MongoClient } from 'mongodb';
import { getMongoClient, getMongoDb, logDbError } from './mongodb';
export { getMongoDb, logDbError, getMongoClient };
import {
  StoreData,
  SiteSettings,
  GameItem,
  PackageItem,
  CouponItem,
  OrderItem,
  AuditLogItem,
  UserProfile,
  WalletTransaction,
  OrderStatus
} from './types';

/**
 * Record an audit log entry
 */
export async function recordAuditLog(log: {
  action: string;
  entity: string;
  entityId?: string;
  author: string;
  details: string;
}) {
  const upper = log.action.toUpperCase();
  const validAction: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGE' =
    upper === 'CREATED' || upper === 'DELETED' || upper === 'STATUS_CHANGE'
      ? (upper as any)
      : 'UPDATED';
  return addAuditLog(validAction, log.entity, log.details, log.author);
}

// In-memory fallback if database is cold-starting
const DEFAULT_SETTINGS: SiteSettings = {
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
  slides: []
};

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function getRequiredMongoClient(action: string): Promise<MongoClient> {
  const mongo = await getMongoClient();
  if (!mongo) {
    logDbError(`lib/db.ts:${action}`);
    throw new Error('Database connection unavailable');
  }
  return mongo;
}

/**
 * Returns comprehensive store data from MongoDB Atlas
 */
export async function getStoreData(): Promise<StoreData> {
  const mongo = await getMongoClient();
  if (!mongo) {
    logDbError('lib/db.ts:getStoreData');
    return {
      settings: DEFAULT_SETTINGS,
      trustBadges: [],
      games: [],
      coupons: [],
      orders: [],
      auditLogs: [],
      users: []
    };
  }

  const db = mongo.db();
  const noId = { projection: { _id: 0 } };
  const [settingsDoc, games, coupons, orders, auditLogs, users] = await Promise.all([
    db.collection('settings').findOne({ _id: 'main' as any }, noId),
    db.collection<GameItem>('games').find({ isArchived: { $ne: true } }, noId).toArray(),
    db.collection<CouponItem>('coupons').find({}, noId).toArray(),
    db.collection<OrderItem>('orders').find({}, noId).sort({ timestamp: -1 }).limit(100).toArray(),
    db.collection<AuditLogItem>('auditLogs').find({}, noId).sort({ timestamp: -1 }).limit(100).toArray(),
    db.collection<UserProfile>('users').find({}, noId).sort({ createdAt: -1 }).toArray()
  ]);

  const sanitizedUsers = users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });

  const mergedSettings: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...(settingsDoc?.settings || {}),
    slides: settingsDoc?.settings?.slides || []
  };

  const normalizedGames = (games || []).map(g => ({
    ...g,
    poster: g.poster || (g as any).image || '/banner.webp',
    category_name: g.category_name || (g as any).publisher || g.category || 'Game Top-Up',
    badge: g.badge || 'HOT',
    badge_color: g.badge_color || '#e11d48',
    delivery_time: g.delivery_time || (g as any).deliveryTime || '1-10 Mins',
    packages: (g.packages || []).map(p => ({
      ...p,
      stock: p.stock ?? (p as any).inStock ?? true,
    })),
  }));

  const normalizedBadges = (settingsDoc?.trustBadges || []).map((b: any) => ({
    ...b,
    sub: b.sub || b.subtitle || '',
  }));

  // Ensure strictly plain serializable JSON objects for Next.js Server -> Client Component props
  return JSON.parse(JSON.stringify({
    settings: mergedSettings,
    trustBadges: normalizedBadges,
    games: normalizedGames,
    coupons: coupons || [],
    orders: orders || [],
    auditLogs: auditLogs || [],
    users: sanitizedUsers
  }));
}

/**
 * Add an audit log entry
 */
export async function addAuditLog(
  action: AuditLogItem['action'],
  entity: string,
  details: string,
  author: string = 'System'
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
      console.warn('[MongoDB] Failed to log audit:', e);
    }
  }

  return entry;
}

/**
 * Update Site Settings & Trust Badges
 */
export async function updateSiteSettings(
  settings: Partial<SiteSettings>,
  trustBadges?: any[],
  author: string = 'admin'
) {
  const mongo = await getRequiredMongoClient('updateSiteSettings');

  const updateDoc: any = {};
  if (settings) updateDoc['settings'] = settings;
  if (Array.isArray(trustBadges)) updateDoc['trustBadges'] = trustBadges;

  await mongo.db().collection('settings').updateOne(
    { _id: 'main' as any },
    { $set: updateDoc },
    { upsert: true }
  );

  await addAuditLog('UPDATED', 'Site Settings & CMS', 'Updated branding, ticker, slides, or trust badges', author);
  return getStoreData();
}

/**
 * Save or update a game catalog item
 */
export async function saveGame(game: GameItem, author: string = 'admin'): Promise<GameItem> {
  const mongo = await getRequiredMongoClient('saveGame');

  const normalizedPackages = (game.packages || []).map((p: any) => ({
    ...p,
    stock: p.stock ?? p.inStock ?? true,
    inStock: p.stock ?? p.inStock ?? true,
  }));

  const docToSave: any = {
    ...game,
    poster: game.poster || (game as any).image || '/banner.webp',
    image: game.poster || (game as any).image || '/banner.webp',
    packages: normalizedPackages,
    active: game.active ?? true,
    isArchived: false,
  };
  delete docToSave._id;

  const existing = await mongo.db().collection<GameItem>('games').findOne({ id: game.id } as any);
  const isNew = !existing;

  await mongo.db().collection('games').updateOne(
    { id: game.id } as any,
    { $set: docToSave },
    { upsert: true }
  );

  await addAuditLog(
    isNew ? 'CREATED' : 'UPDATED',
    `Game: ${game.name}`,
    isNew ? 'Created new game catalog entry' : 'Updated game configuration and packages',
    author
  );

  return docToSave;
}

/**
 * Delete or soft-delete (archive) a game
 */
export async function deleteGame(gameId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getRequiredMongoClient('deleteGame');

  const db = mongo.db();
  const game = await db.collection<GameItem>('games').findOne({ id: gameId } as any);
  const gameName = game ? game.name : gameId;

  // Check if orders exist for this game -> soft delete/archive to protect data integrity
  const orderCount = await db.collection('orders').countDocuments({ gameId });
  if (orderCount > 0) {
    await db.collection('games').updateOne({ id: gameId } as any, { $set: { isArchived: true, active: false } });
    await addAuditLog('DELETED', `Game: ${gameName}`, `Soft-deleted/archived game with ${orderCount} historical orders`, author);
  } else {
    await db.collection('games').deleteOne({ id: gameId } as any);
    await addAuditLog('DELETED', `Game: ${gameName}`, `Hard deleted game with zero orders`, author);
  }

  return true;
}

/**
 * Save or update a package in a game
 */
export async function savePackage(gameId: string, pkg: PackageItem, author: string = 'admin'): Promise<PackageItem> {
  const mongo = await getRequiredMongoClient('savePackage');

  const db = mongo.db();
  const game = await db.collection<GameItem>('games').findOne({ id: gameId } as any);
  if (!game) throw new Error('Game not found');

  const normalizedPkg: PackageItem & { inStock?: boolean } = {
    ...pkg,
    stock: pkg.stock ?? (pkg as any).inStock ?? true,
    inStock: pkg.stock ?? (pkg as any).inStock ?? true,
  };

  if (!game.packages) game.packages = [];
  const pIndex = game.packages.findIndex(p => p.id === normalizedPkg.id);
  const isNew = pIndex === -1;
  if (isNew) {
    game.packages.push(normalizedPkg);
  } else {
    game.packages[pIndex] = normalizedPkg;
  }

  await db.collection('games').updateOne(
    { id: gameId } as any,
    { $set: { packages: game.packages } }
  );

  await addAuditLog(
    isNew ? 'CREATED' : 'UPDATED',
    `Package: ${normalizedPkg.name} (${game.name})`,
    `${isNew ? 'Added package' : 'Updated package'}: ৳${normalizedPkg.price} (${normalizedPkg.stock ? 'In Stock' : 'Out of Stock'})`,
    author
  );

  return normalizedPkg;
}

/**
 * Delete a package from a game
 */
export async function deletePackage(gameId: string, pkgId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getRequiredMongoClient('deletePackage');

  const db = mongo.db();
  const game = await db.collection<GameItem>('games').findOne({ id: gameId } as any);
  if (!game) throw new Error('Game not found');

  const pkg = game.packages?.find(p => p.id === pkgId);
  const pkgName = pkg ? pkg.name : pkgId;

  const updatedPackages = (game.packages || []).filter(p => p.id !== pkgId);
  await db.collection('games').updateOne(
    { id: gameId } as any,
    { $set: { packages: updatedPackages } }
  );

  await addAuditLog('DELETED', `Package: ${pkgName} (${game.name})`, `Deleted package ${pkgId}`, author);
  return true;
}

/**
 * Save or update a coupon
 */
export async function saveCoupon(coupon: CouponItem, author: string = 'admin'): Promise<CouponItem> {
  const mongo = await getRequiredMongoClient('saveCoupon');

  const docToSave = { ...coupon };
  delete (docToSave as any)._id;

  await mongo.db().collection('coupons').updateOne(
    { id: coupon.id } as any,
    { $set: docToSave },
    { upsert: true }
  );

  await addAuditLog(
    'UPDATED',
    `Coupon: ${coupon.code}`,
    `Updated coupon discount: ৳${coupon.discount}, min spend ৳${coupon.minSpend}, active: ${coupon.active}`,
    author
  );

  return coupon;
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(couponId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getRequiredMongoClient('deleteCoupon');

  const db = mongo.db();
  const coupon = await db.collection<CouponItem>('coupons').findOne({ id: couponId } as any);
  const code = coupon ? coupon.code : couponId;

  await db.collection('coupons').deleteOne({ id: couponId } as any);
  await addAuditLog('DELETED', `Coupon: ${code}`, `Deleted coupon with ID ${couponId}`, author);
  return true;
}

/**
 * Atomic Order Creation with Server Price Recalculation & Fraud Prevention
 */
export async function createOrder(orderPayload: {
  gameId: string;
  packageIds: string[];
  paymentMethod: 'bKash' | 'Nagad' | 'Wallet';
  senderLastDigits: string;
  customData: Record<string, any>;
  couponCode?: string;
  userId?: string;
  userEmail?: string;
}): Promise<OrderItem> {
  const mongo = await getRequiredMongoClient('createOrder');

  const db = mongo.db();

  // 1. Fetch real game and package details from database
  const game = await db.collection<GameItem>('games').findOne({ id: orderPayload.gameId } as any);
  if (!game || game.isArchived || game.active === false) {
    throw new Error('Selected game is currently unavailable');
  }

  const verifiedPackages: { id: string; name: string; price: number }[] = [];
  let calculatedSubtotal = 0;

  for (const pkgId of orderPayload.packageIds) {
    const pkg = game.packages?.find(p => p.id === pkgId);
    if (!pkg) {
      throw new Error(`Package ${pkgId} not found in game catalog`);
    }
    if (!pkg.stock) {
      throw new Error(`Package ${pkg.name} is currently out of stock`);
    }
    const price = Number(pkg.price);
    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid price configured for package ${pkg.name}`);
    }
    verifiedPackages.push({ id: pkg.id, name: pkg.name, price });
    calculatedSubtotal += price;
  }

  // 2. Server-side coupon verification
  let discount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (orderPayload.couponCode) {
    const cleanCode = orderPayload.couponCode.trim().toUpperCase();
    const coupon = await db.collection<CouponItem>('coupons').findOne({ code: cleanCode, active: true } as any);

    if (coupon) {
      if (calculatedSubtotal >= (coupon.minSpend || 0)) {
        if (!coupon.maxUsage || (coupon.usageCount || 0) < coupon.maxUsage) {
          discount = Math.min(coupon.discount, calculatedSubtotal);
          appliedCouponCode = coupon.code;
          // Increment coupon usage count
          await db.collection('coupons').updateOne({ code: cleanCode }, { $inc: { usageCount: 1 } });
        }
      }
    }
  }

  const finalTotal = Math.max(0, calculatedSubtotal - discount);

  // 3. For bKash / Nagad: Duplicate TrxID Prevention
  if (orderPayload.paymentMethod !== 'Wallet') {
    const trimmedDigits = orderPayload.senderLastDigits.trim();
    if (trimmedDigits.length < 4) {
      throw new Error('Please enter a valid TrxID or sender last digits');
    }

    // Check if this exact TrxID was already used for an approved or completed order
    const duplicate = await db.collection<OrderItem>('orders').findOne({
      senderLastDigits: trimmedDigits,
      paymentMethod: orderPayload.paymentMethod,
      status: { $in: ['Completed', 'Delivered'] }
    } as any);

    if (duplicate) {
      throw new Error(`Transaction ID '${trimmedDigits}' has already been processed for order ${duplicate.id}`);
    }
  }

  // 4. For Wallet Payment: Atomic balance check & deduction
  if (orderPayload.paymentMethod === 'Wallet') {
    if (!orderPayload.userId) {
      throw new Error('Login required for wallet payment');
    }

    const user = await db.collection<UserProfile>('users').findOne({ id: orderPayload.userId } as any);
    if (!user || (user.walletBalance || 0) < finalTotal) {
      throw new Error(`Insufficient wallet balance (Available: ৳${user?.walletBalance || 0}, Required: ৳${finalTotal})`);
    }

    // Atomic deduction
    const res = await db.collection('users').updateOne(
      { id: orderPayload.userId, walletBalance: { $gte: finalTotal } },
      { $inc: { walletBalance: -finalTotal } }
    );

    if (res.modifiedCount === 0) {
      throw new Error('Wallet payment failed due to concurrent balance change');
    }

    // Record wallet transaction
    await db.collection('walletTransactions').insertOne({
      id: `wtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: orderPayload.userId,
      type: 'payment',
      amount: finalTotal,
      balanceBefore: user.walletBalance,
      balanceAfter: user.walletBalance - finalTotal,
      note: `Payment for order of ${game.name}`,
      timestamp: Date.now()
    });
  }

  // 5. Generate unique Order ID
  const orderId = 'SONIC-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder: OrderItem = {
    id: orderId,
    userId: orderPayload.userId,
    gameId: game.id,
    gameName: game.name,
    packages: verifiedPackages,
    totalAmount: finalTotal,
    paymentMethod: orderPayload.paymentMethod,
    senderLastDigits: orderPayload.senderLastDigits,
    customData: orderPayload.customData,
    status: 'Pending',
    date: getFormattedDate(),
    timestamp: Date.now(),
    couponCode: appliedCouponCode,
    discountAmount: discount
  };

  await db.collection('orders').insertOne(newOrder as any);

  await addAuditLog(
    'CREATED',
    `Order: ${orderId}`,
    `New order submitted for ${game.name} (৳${finalTotal}) via ${orderPayload.paymentMethod}`,
    orderPayload.userEmail || orderPayload.userId || 'Customer'
  );

  return newOrder;
}

/**
 * Update order status with optional wallet refund
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  author: string = 'admin',
  adminNotes?: string,
  refundToWallet?: boolean
): Promise<OrderItem> {
  const mongo = await getRequiredMongoClient('updateOrderStatus');

  const db = mongo.db();
  const order = await db.collection<OrderItem>('orders').findOne({ id: orderId } as any);
  if (!order) throw new Error('Order not found');

  const oldStatus = order.status;
  const updateFields: any = { status: newStatus };
  if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

  // Handle wallet refund
  if (refundToWallet && (newStatus === 'Cancelled' || newStatus === 'Refunded' || newStatus === 'Failed')) {
    if (order.userId && order.totalAmount > 0) {
      const user = await db.collection<UserProfile>('users').findOne({ id: order.userId } as any);
      if (user) {
        await db.collection('users').updateOne(
          { id: order.userId },
          { $inc: { walletBalance: order.totalAmount } }
        );
        await db.collection('walletTransactions').insertOne({
          id: `wtx-ref-${Date.now()}`,
          userId: order.userId,
          type: 'refund',
          amount: order.totalAmount,
          balanceBefore: user.walletBalance || 0,
          balanceAfter: (user.walletBalance || 0) + order.totalAmount,
          referenceId: order.id,
          note: `Refund for cancelled order ${order.id}`,
          timestamp: Date.now()
        });
      }
    }
  }

  await db.collection('orders').updateOne({ id: orderId } as any, { $set: updateFields });

  await addAuditLog(
    'STATUS_CHANGE',
    `Order: ${orderId}`,
    `Status updated from ${oldStatus} to ${newStatus}${refundToWallet ? ' (Refunded to Wallet)' : ''}`,
    author
  );

  return { ...order, ...updateFields };
}

/**
 * Retrieve user profiles
 */
export async function getUsers(): Promise<UserProfile[]> {
  const mongo = await getMongoClient();
  if (!mongo) return [];

  const users = await mongo.db().collection<UserProfile>('users').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
}

/**
 * Find user by ID or Email
 */
export async function getUserById(id: string): Promise<UserProfile | null> {
  const mongo = await getMongoClient();
  if (!mongo) return null;
  return mongo.db().collection<UserProfile>('users').findOne({ id } as any, { projection: { _id: 0 } });
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const mongo = await getMongoClient();
  if (!mongo) return null;
  return mongo.db().collection<UserProfile>('users').findOne({ email: email.toLowerCase() } as any, { projection: { _id: 0 } });
}

/**
 * Delete an order from MongoDB
 */
export async function deleteOrder(orderId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getRequiredMongoClient('deleteOrder');
  const db = mongo.db();

  const existing = await db.collection<OrderItem>('orders').findOne({ id: orderId } as any);
  if (!existing) throw new Error('Order not found');

  await db.collection('orders').deleteOne({ id: orderId } as any);
  await addAuditLog(
    'DELETED',
    `Order: ${orderId}`,
    `Deleted order (${existing.gameName} - ৳${existing.totalAmount})`,
    author
  );
  return true;
}

/**
 * Update user profile or privileges
 */
export async function updateUser(
  userId: string,
  updates: Partial<UserProfile>,
  author: string = 'Admin'
): Promise<UserProfile | null> {
  const mongo = await getRequiredMongoClient('updateUser');

  const db = mongo.db();
  const docToSave: Record<string, any> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (key === '_id' || key === 'password' || val === undefined || val === null) continue;
    docToSave[key] = val;
  }

  await db.collection('users').updateOne(
    { id: userId } as any,
    { $set: docToSave },
    { upsert: true }
  );

  const updated = await db.collection<UserProfile>('users').findOne({ id: userId } as any, { projection: { _id: 0 } });
  if (updated) {
    delete (updated as any).password;
  }

  await addAuditLog(
    'UPDATED',
    `User: ${updates.email || updates.name || userId}`,
    `Updated fields: ${Object.keys(docToSave).join(', ')}${docToSave.role ? ` (Role -> ${docToSave.role})` : ''}`,
    author
  );

  return updated;
}

/**
 * Create a new user/staff/admin directly from Admin Panel
 */
export async function createUserByAdmin(
  userData: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    role: UserProfile['role'];
    walletBalance: number;
  },
  author: string = 'Admin'
): Promise<UserProfile> {
  const mongo = await getRequiredMongoClient('createUserByAdmin');
  const db = mongo.db();

  const cleanEmail = userData.email.toLowerCase().trim();
  const existing = await db.collection('users').findOne({ email: cleanEmail });
  if (existing) {
    throw new Error(`A user with email '${cleanEmail}' already exists.`);
  }

  const newUser: any = {
    id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: userData.name.trim(),
    email: cleanEmail,
    ...(userData.phone ? { phone: userData.phone.trim() } : {}),
    password: userData.passwordHash,
    role: userData.role || 'user',
    walletBalance: Number(userData.walletBalance) || 0,
    status: 'active',
    createdAt: Date.now(),
  };

  await db.collection('users').insertOne(newUser);
  const { password: _, ...safeUser } = newUser;

  await addAuditLog(
    'CREATED',
    `User: ${cleanEmail}`,
    `Created user account with role '${newUser.role}' and wallet ৳${newUser.walletBalance}`,
    author
  );

  return safeUser as UserProfile;
}

/**
 * Delete a user account from MongoDB
 */
export async function deleteUser(userId: string, author: string = 'Admin'): Promise<boolean> {
  const mongo = await getRequiredMongoClient('deleteUser');
  const db = mongo.db();

  const existing = await db.collection<UserProfile>('users').findOne({ id: userId } as any);
  if (!existing) throw new Error('User not found');

  await db.collection('users').deleteOne({ id: userId } as any);
  await addAuditLog(
    'DELETED',
    `User: ${existing.email || existing.name || userId}`,
    `Deleted user account (Role was: ${existing.role})`,
    author
  );
  return true;
}

/**
 * Adjust wallet balance with audit logging
 */
export async function adjustWalletBalance(
  userId: string,
  amount: number,
  type: 'deposit' | 'payment' | 'refund' | 'adjustment',
  referenceId?: string,
  note?: string,
  author: string = 'System'
): Promise<number> {
  const mongo = await getRequiredMongoClient('adjustWalletBalance');

  const db = mongo.db();
  const user = await db.collection<UserProfile>('users').findOne({ id: userId } as any);
  if (!user) throw new Error('User not found');

  const balanceBefore = user.walletBalance || 0;
  const balanceAfter = balanceBefore + amount;
  if (balanceAfter < 0) {
    throw new Error('Resulting wallet balance cannot be negative');
  }

  await db.collection('users').updateOne(
    { id: userId },
    { $set: { walletBalance: balanceAfter } }
  );

  await db.collection('walletTransactions').insertOne({
    id: `wtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    referenceId,
    note: note || `Wallet ${type}`,
    timestamp: Date.now()
  });

  await addAuditLog(
    'UPDATED',
    `Wallet: ${userId}`,
    `Adjusted balance by ৳${amount} (New balance: ৳${balanceAfter})`,
    author
  );

  return balanceAfter;
}
