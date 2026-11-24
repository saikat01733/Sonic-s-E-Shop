export interface GameOption {
  id: string;
  name: string;
  sub: string;
  icon: string;
  color: string;
}

export interface CustomField {
  id: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'device_selector';
  label: string;
  label_bn?: string;
  placeholder?: string;
  required?: boolean;
  options?: GameOption[];
  default?: string;
}

export interface PackageItem {
  id: string;
  name: string;
  price: number | null;
  stock: boolean;
  icon?: string;
  badge?: string;
}

export interface GameItem {
  id: string;
  slug: string;
  name: string;
  name_bn?: string;
  category: string;
  category_name: string;
  badge: string;
  badge_color: string;
  poster: string;
  icon: string;
  product_type: 'login_purchase' | 'in_game_id';
  delivery_time: string;
  trust_tag: string;
  description: string;
  rules: string[];
  custom_fields: CustomField[];
  packages: PackageItem[];
}

export interface CouponItem {
  id: string;
  code: string;
  discount: number;
  minSpend: number;
  description: string;
  colorClass: string;
  active: boolean;
  expiryDate?: string;
}

export interface TrustBadge {
  id: string;
  title: string;
  sub: string;
  icon: string;
}

export interface HeroSlide {
  id: string;
  gameId: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  deliveryTime: string;
  image: string;
  color?: string;
}

export interface BenefitItem {
  id?: string;
  icon: string;
  title: string;
  desc: string;
}

export interface WhyChooseUsSection {
  title: string;
  subtitle: string;
  benefits: BenefitItem[];
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  tickerText: string;
  heroBanner: string;
  heroTitle: string;
  heroSubtitle: string;
  supportPhone: string;
  whatsappUrl: string;
  facebookUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  adminPin: string;
  slides?: HeroSlide[];
  whyChooseUs?: WhyChooseUsSection;
}

export interface OrderItem {
  id: string;
  gameId: string;
  gameName: string;
  packages: { id: string; name: string; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  senderLastDigits: string;
  customData: Record<string, string>;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  date: string;
  timestamp: number;
}

export interface AuditLogItem {
  id: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGE';
  entity: string;
  details: string;
  author: string;
  timestamp: number;
  dateStr: string;
}

export interface StoreData {
  settings: SiteSettings;
  trustBadges: TrustBadge[];
  games: GameItem[];
  coupons: CouponItem[];
  orders: OrderItem[];
  auditLogs: AuditLogItem[];
}
