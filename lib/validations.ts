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
  packages: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(100),
      price: z.number().int().positive('Price must be a positive integer'),
      originalPrice: z.number().int().positive().optional(),
      inStock: z.boolean().default(true),
      badge: z.string().max(50).optional(),
    })
  ).min(1, 'At least one package must be selected'),
  totalAmount: z.number().int().positive('Total amount must be greater than zero'),
  paymentMethod: z.enum(['bKash', 'Nagad']),
  senderLastDigits: z
    .string()
    .min(4, 'Sender number or TrxID must be at least 4 characters')
    .max(50, 'Sender digits cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Contains invalid characters or malicious script'),
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
  role: z.enum(['user', 'admin']),
  walletBalance: z.number().nonnegative().optional(),
}).passthrough();

/**
 * Schema for Order status updates
 */
export const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1).max(100),
  status: z.enum(['Pending', 'Processing', 'Completed', 'Cancelled']),
  author: z.string().max(100).optional().default('admin'),
});
