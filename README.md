# ⚡ Sonic's E-Shop & Sonic CMS (Production Edition)

> Bangladesh's #1 Automated Game Top-Up Store built with **Next.js 16 (App Router)**, **Tailwind CSS**, **MongoDB Atlas**, **Universal Jose JWT Sessions**, **ImgBB CDN API**, and **Firebase Auth**.

![Sonic E-Shop](public/banner.webp)

---

## 🌟 Key Architecture & Highlights

### 🚀 Phase 0: 100% Serverless Cloud Persistence (Zero `fs` Operations)
- **Root Cause Fixed**: Completely eliminated all runtime filesystem writes (`writeFileStore` / `store.json.tmp.*`) which threw `EROFS: read-only file system` errors on Vercel lambda `/var/task`.
- **Database Engine**: Migrated 100% of runtime data persistence to **MongoDB Atlas Cloud**.
- **Collections & Indexes**: Includes `settings`, `games`, `coupons`, `orders`, `users`, `walletTransactions`, `auditLogs`. Indexed by unique order numbers, user IDs, and game slugs.
- **Vercel Edge Region**: Configured to `sin1` (Singapore) in `vercel.json` for lowest latency from Bangladesh.

### 🛡️ Phase 1: Authentication & Role-Based Access Control (RBAC)
- **Role Enforcement**: Public registration (`/api/auth/register`) strictly forces `role = 'user'`, ignoring any client-sent mass-assignment payloads.
- **Super Administrator**: Seeded securely from `ADMIN_EMAIL` and `ADMIN_PASSWORD` hashed with `bcryptjs`.
- **Session Security**: Session tokens are encrypted and signed via `jose` HS256 JWT, stored exclusively in an `httpOnly`, `Secure` (production), `SameSite=Lax` cookie. No tokens or roles in `localStorage`.
- **Server-Side API Guards**: Middleware and `requireAdmin()` interceptors guard `/api/admin/*` and `/admin/*`. Non-admins receive HTTP 401/403.
- **Admin Security Suite**: Master password change, session tracking, and audit logging.

### 💳 Phase 2: User Order Flow & Gamer Wallet
- **Server-Side Price Recalculation**: The server recalculates package prices and discounts directly from MongoDB. Client totals are never trusted.
- **Coupon Validation**: Checks active status, expiration, minimum spend, and tracks usage counts.
- **Duplicate TrxID Prevention**: Blocks re-use of bKash/Nagad transaction numbers.
- **Gamer Wallet**: Real database ledger with atomic balance checking & deduction (`$inc: { walletBalance: -amount }`). Supports 1-click checkout, ৳100 welcome bonus, top-up deposit requests, and order refunds.

### ⚙️ Phase 3: Admin CMS & Live Orders Hub
- **100% English Admin Panel**: Zero Bengali tokens in admin labels and controls.
- **Overview & KPIs**: Real-time revenue from Completed/Delivered orders with date filters (`All Time`, `Today`, `7 Days`, `30 Days`).
- **Live Orders Hub**: Order status transitions (`Pending` → `Processing` → `Delivered` / `Completed` / `Failed` / `Refunded` / `Cancelled`), admin notes, refund-to-wallet checkbox, and CSV export.
- **Image Uploads**: Native multipart proxy to **ImgBB CDN API** (`https://api.imgbb.com/1/upload`).
- **Catalog Management**: Full CRUD for games (with soft-delete archiving for games with historical orders), packages, and coupons.

### 📱 Phase 4: Responsive Design (320px → 1440px+)
- **Mobile Admin Drawer**: Accessible via hamburger button with focus trap and dark backdrop on screens <768px.
- **Dock Safe-Area**: Bottom navigation dock adapts across screen sizes and hides admin link for standard users.
- **Rose Button Accents**: Solid Gaming Rose (`#e11d48`) button accents and high-contrast liquid glass cards.

### 🔍 Phase 5: SEO & Server-Side Rendering (SSR/ISR)
- **No Client Spinner**: Home, Games, and Coupons pre-render via SSR with ISR (`revalidate = 60s`).
- **Dynamic Metadata & OG Cards**: Powered by dynamic `SITE_URL` with canonical links.
- **Dynamic Sitemap & Robots**: `sitemap.xml` dynamically queries MongoDB games catalog; `robots.txt` protects internal API and admin endpoints.

---

## 🛠️ Environment Variables Setup (Vercel)

Add the following to **Vercel Project Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `MONGODB_DB` | Database name (e.g. `sonic_eshop`) |
| `SITE_URL` | Live production URL (`https://sonic-s-e-shop.vercel.app`) |
| `JWT_SECRET` | Secret key for signing session tokens |
| `ADMIN_EMAIL` | Super Admin email address (`saikatahmmad77@gmail.com`) |
| `ADMIN_PASSWORD` | Super Admin initial password |
| `IMGBB_API_KEY` | ImgBB CDN API upload key (`f4df601fbbe9f7e258525727fabc681c`) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Client configuration keys |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Seed database
node scripts/seed.mjs

# 3. Run verification test suite
node scripts/verify-all.mjs

# 4. Start development server
npm run dev
```

---

## 👨‍💻 Author & Credits
- **Developer**: [md-asif-iqbal](https://github.com/saikat01733) (`md.asifiqbal2008@gmail.com`)
- **Project**: Sonic's E-Shop
