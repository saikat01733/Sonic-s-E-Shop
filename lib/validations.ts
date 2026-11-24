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
  title: z.string(),
  subtitle: z.string(),
  badge: z.string(),
  deliveryTime: z.string(),
  image: z.string(),
  color: z.string().optional(),
}).passthrough();

/**
 * Schema for Site Settings CMS updates
 */
export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  logo: z.string().max(500).optional(),
  heroTitle: z.string().min(1).max(150),
  heroSubtitle: z.string().min(1).max(250),
  heroBanner: z.string().min(1).max(500),
  tickerText: z.string().min(1).max(500),
  bkashNumber: z.string().min(5).max(30),
  nagadNumber: z.string().min(5).max(30),
  supportPhone: z.string().min(5).max(30),
  whatsappUrl: z.string().min(5).max(250),
  facebookUrl: z.string().max(250).optional(),
  slides: z.array(HeroSlideSchema).optional(),
  whyChooseUs: z.any().optional(),
}).passthrough();

/**
 * Schema for Trust Badge
 */
export const TrustBadgeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  sub: z.string().min(1).max(200).optional(),
  desc: z.string().min(1).max(200).optional(),
  icon: z.string().min(1).max(50),
}).passthrough();

/**
 * Schema for Game items
 */
export const GameSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  name_bn: z.string().max(100).optional(),
  poster: z.string().min(1).max(500),
  category_name: z.string().min(1).max(100),
  badge: z.string().min(1).max(50),
  badge_color: z.string().min(1).max(30),
  delivery_time: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
  packages: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(100),
      price: z.number().int().positive(),
      originalPrice: z.number().int().positive().optional(),
      inStock: z.boolean().default(true),
      badge: z.string().max(50).optional(),
    }).passthrough()
  ).default([]),
}).passthrough();

/**
 * Schema for Coupon items
 */
export const CouponSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(30),
  discount: z.number().nonnegative('Discount must be positive'),
  minSpend: z.number().nonnegative().default(0),
  description: z.string().max(250).optional().default(''),
  colorClass: z.string().max(50).optional().default('coupon-red'),
  active: z.boolean().default(true),
  isActive: z.boolean().optional(),
  expiryDate: z.string().max(50).optional(),
}).passthrough();

/**
 * Schema for User profile and role updates
 */
export const UserUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  role: z.enum(['user', 'staff', 'admin', 'super_admin']),
  walletBalance: z.number().nonnegative().optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
}).passthrough();

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
