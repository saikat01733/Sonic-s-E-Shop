import { getMongoClient } from './mongodb';
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
 * Convenience helper to obtain the active MongoDB database instance
 */
export async function getMongoDb() {
  const client = await getMongoClient();
  return client ? client.db() : null;
}

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

/**
 * Returns comprehensive store data from MongoDB Atlas
 */
export async function getStoreData(): Promise<StoreData> {
  const mongo = await getMongoClient();
  if (!mongo) {
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
  const [settingsDoc, games, coupons, orders, auditLogs, users] = await Promise.all([
    db.collection('settings').findOne({ _id: 'main' as any }),
    db.collection<GameItem>('games').find({ isArchived: { $ne: true } }).toArray(),
    db.collection<CouponItem>('coupons').find({}).toArray(),
    db.collection<OrderItem>('orders').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
    db.collection<AuditLogItem>('auditLogs').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
    db.collection<UserProfile>('users').find({}).sort({ createdAt: -1 }).toArray()
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

  return {
    settings: mergedSettings,
    trustBadges: settingsDoc?.trustBadges || [],
    games: games || [],
    coupons: coupons || [],
    orders: orders || [],
    auditLogs: auditLogs || [],
    users: sanitizedUsers
  };
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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

  const updateDoc: any = {};
  if (settings) updateDoc['settings'] = settings;
  if (trustBadges) updateDoc['trustBadges'] = trustBadges;

  await mongo.db().collection('settings').updateOne(
    { _id: 'main' as any },
    { $set: updateDoc },
    { upsert: true }
  );

  await addAuditLog('UPDATED', 'Site Settings & CMS', 'Updated branding, ticker, or payment details', author);
  return getStoreData();
}

/**
 * Save or update a game catalog item
 */
export async function saveGame(game: GameItem, author: string = 'admin'): Promise<GameItem> {
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

  const docToSave = { ...game, isArchived: false };
  delete (docToSave as any)._id;

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

  return game;
}

/**
 * Delete or soft-delete (archive) a game
 */
export async function deleteGame(gameId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

  const db = mongo.db();
  const game = await db.collection<GameItem>('games').findOne({ id: gameId } as any);
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
    `${isNew ? 'Added package' : 'Updated package'}: ৳${pkg.price} (${pkg.stock ? 'In Stock' : 'Out of Stock'})`,
    author
  );

  return pkg;
}

/**
 * Delete a package from a game
 */
export async function deletePackage(gameId: string, pkgId: string, author: string = 'admin'): Promise<boolean> {
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

  const db = mongo.db();
  const game = await db.collection<GameItem>('games').findOne({ id: gameId } as any);
  if (!game) throw new Error('Game not found');

  const pkg = game.packages?.find(p => p.id === pkgId);
  const pkgName = pkg ? pkg.name : pkgId;

  game.packages = (game.packages || []).filter(p => p.id !== pkgId);
  await saveGame(game, author);

  await addAuditLog('DELETED', `Package: ${pkgName} (${game.name})`, `Deleted package ${pkgId}`, author);
  return true;
}

/**
 * Save or update a coupon
 */
export async function saveCoupon(coupon: CouponItem, author: string = 'admin'): Promise<CouponItem> {
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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

  const users = await mongo.db().collection<UserProfile>('users').find({}).sort({ createdAt: -1 }).toArray();
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
  return mongo.db().collection<UserProfile>('users').findOne({ id } as any);
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const mongo = await getMongoClient();
  if (!mongo) return null;
  return mongo.db().collection<UserProfile>('users').findOne({ email: email.toLowerCase() } as any);
}

/**
 * Update user profile or privileges
 */
export async function updateUser(
  userId: string,
  updates: Partial<UserProfile>,
  author: string = 'Admin'
): Promise<UserProfile | null> {
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

  const db = mongo.db();
  const docToSave = { ...updates };
  delete (docToSave as any)._id;

  await db.collection('users').updateOne(
    { id: userId } as any,
    { $set: docToSave },
    { upsert: true }
  );

  const updated = await db.collection<UserProfile>('users').findOne({ id: userId } as any);

  await addAuditLog(
    'UPDATED',
    `User: ${userId}`,
    `Updated fields: ${Object.keys(updates).join(', ')}`,
    author
  );

  return updated;
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
  const mongo = await getMongoClient();
  if (!mongo) throw new Error('Database connection unavailable');

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
