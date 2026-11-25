import { z } from 'zod';

/**
 * Strips dangerous HTML tags, javascript URIs, and scripts
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Schema for customer order submissions
 */
export const OrderSubmissionSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required').max(100),
  gameName: z.string().min(1, 'Game name is required').max(150),
  packageIds: z.array(z.string().min(1)).min(1, 'At least one package must be selected').optional(),
  packages: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(100),
      price: z.number().nonnegative().optional(),
      originalPrice: z.number().nonnegative().optional(),
      inStock: z.boolean().default(true).optional(),
      badge: z.string().max(50).optional(),
    })
  ).min(1, 'At least one package must be selected').optional(),
  totalAmount: z.number().nonnegative().optional(),
  paymentMethod: z.enum(['bKash', 'Nagad', 'Wallet']),
  senderLastDigits: z
    .string()
    .min(1, 'Sender number or TrxID is required')
    .max(50, 'Sender digits cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Contains invalid characters or malicious script')
    .default('WALLET'),
  couponCode: z.string().max(50).optional(),
  customData: z.record(z.string(), z.any()).optional().default({}),
});

export const HeroSlideSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  slug: z.string(),
  title: z.string().min(1),
  subtitle: z.string().nullish().default(''),
  badge: z.string().nullish().default(''),
  deliveryTime: z.string().nullish().default('1-10 Mins'),
  image: z.string().min(1),
  color: z.string().nullish(),
}).passthrough();

/**
 * Schema for Site Settings CMS updates
 */
export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  logo: z.string().max(500).nullish(),
  heroTitle: z.string().min(1).max(150),
  heroSubtitle: z.string().min(1).max(250),
  heroBanner: z.string().min(1).max(500),
  tickerText: z.string().min(1).max(500),
  bkashNumber: z.string().min(5).max(30),
  nagadNumber: z.string().min(5).max(30),
  supportPhone: z.string().max(30).nullish(),
  whatsappUrl: z.string().max(250).nullish(),
  facebookUrl: z.string().max(250).nullish(),
  slides: z.array(HeroSlideSchema).nullish(),
  whyChooseUs: z.any().optional(),
}).passthrough();

/**
 * Schema for Trust Badge
 */
export const TrustBadgeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  sub: z.string().max(200).nullish(),
  subtitle: z.string().max(200).nullish(),
  desc: z.string().max(200).nullish(),
  icon: z.string().min(1).max(50),
}).passthrough();

/**
 * Schema for Package item
 */
export const PackageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  price: z.coerce.number().nonnegative().nullable().optional(),
  originalPrice: z.coerce.number().nonnegative().nullable().optional(),
  stock: z.boolean().optional(),
  inStock: z.boolean().optional(),
  icon: z.string().max(30).nullish(),
  badge: z.string().max(50).nullish(),
}).passthrough();

/**
 * Schema for Game items
 */
export const GameSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  name_bn: z.string().max(100).nullish(),
  poster: z.string().max(500).nullish(),
  image: z.string().max(500).nullish(),
  category_name: z.string().max(100).nullish(),
  badge: z.string().max(50).nullish(),
  badge_color: z.string().max(30).nullish(),
  delivery_time: z.string().max(50).nullish(),
  description: z.string().max(1000).nullish(),
  active: z.boolean().optional(),
  packages: z.array(PackageSchema).default([]),
}).passthrough();

/**
 * Schema for Coupon items
 */
export const CouponSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(30),
  discount: z.coerce.number().nonnegative('Discount must be positive'),
  minSpend: z.coerce.number().nonnegative().default(0),
  description: z.string().max(250).nullish().default(''),
  colorClass: z.string().max(50).nullish().default('coupon-red'),
  active: z.boolean().default(true),
  isActive: z.boolean().optional(),
  maxUsage: z.coerce.number().int().positive().nullish(),
  expiryDate: z.string().max(50).nullish(),
}).passthrough();

/**
 * Schema for User profile and role updates (Handles nullish values from MongoDB/Firebase gracefully)
 */
export const UserUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).nullish(),
  email: z.string().email().or(z.literal('')).nullish(),
  phone: z.string().max(30).nullish(),
  role: z.enum(['user', 'staff', 'admin', 'super_admin']).optional(),
  walletBalance: z.coerce.number().nonnegative().nullish(),
  status: z.enum(['active', 'suspended', 'banned']).nullish(),
}).passthrough();

/**
 * Schema for Admin creating a new user/staff/admin
 */
export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address required').max(120),
  phone: z.string().max(30).nullish(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['user', 'staff', 'admin', 'super_admin']).default('user'),
  walletBalance: z.coerce.number().nonnegative().default(0),
});

/**
 * Schema for Order status updates
 */
export const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1).max(100),
  status: z.enum(['Pending', 'Processing', 'Completed', 'Delivered', 'Failed', 'Refunded', 'Cancelled']),
  adminNote: z.string().max(500).optional(),
  refundToWallet: z.boolean().optional(),
  author: z.string().max(100).optional().default('admin'),
});

/**
 * Schema for User Registration
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  phone: z
    .string()
    .regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, 'Must be a valid Bangladesh phone number (01XXXXXXXXX)')
    .transform(val => {
      // Normalize to 01XXXXXXXXX
      const digits = val.replace(/\D/g, '');
      return digits.startsWith('880') ? digits.slice(2) : digits;
    }),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

/**
 * Schema for User Login
 */
export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for Admin/User Password Change
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});

/**
 * Schema for Wallet Top-up / Deposit Request
 */
export const WalletDepositSchema = z.object({
  amount: z.number().int().min(50, 'Minimum top-up amount is ৳50').max(50000, 'Maximum top-up amount is ৳50,000'),
  paymentMethod: z.enum(['bKash', 'Nagad']),
  senderNumber: z
    .string()
    .regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, 'Must be a valid BD phone number (01XXXXXXXXX)'),
  trxId: z
    .string()
    .min(6, 'TrxID must be at least 6 characters')
    .max(50)
    .regex(/^[A-Za-z0-9]+$/, 'TrxID contains only alphanumeric characters')
    .toUpperCase(),
});
