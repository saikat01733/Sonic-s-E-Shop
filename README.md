# ⚡ Sonic's E-Shop (Khela Store Next.js 16 Edition)

> Bangladesh's #1 Automated Game Top-Up Store built with **Next.js 16 (App Router)**, **Tailwind CSS**, **Framer Motion**, **HeroUI**, **MongoDB**, and **Firebase**.

![Sonic E-Shop](public/banner.webp)

---

## 🌟 Key Features

### 🎮 Storefront (Customer Experience)
- **Live Search & Auto-Suggest**: Instant search dropdown with real-time matching for games and package variants, keyboard shortcuts, and popular tags.
- **Widescreen 3D Magnetic Tilt Cards**: 16:9 game poster presentation for eFootball™ Coins, PUBG Mobile UC, and Roblox Robux with glassmorphic hover details overlay.
- **Dynamic Input Specification**: Context-aware custom fields per game (e.g. Konami ID + Password for eFootball, UID for PUBG Mobile, Username for Roblox).
- **Perforated Voucher Coupons**: Instant 1-click copy with emerald green spring bounce feedback, auto-apply discount calculations, and floating glass toast notifications.
- **Payment & Checkout**: bKash & Nagad personal send-money with 1-click number copy, TrxID validation, animated delivery truck checkout CTA, and instant WhatsApp notification dispatch.
- **Digital Invoices & Tracking**: Printable receipts, order tracking with status badges (`Pending`, `Processing`, `Completed`, `Cancelled`), and retro pull-string lamp login.

---

### 🛡️ Admin CMS & Order Management (`/admin`)
- **Full-Featured Admin Suite**: Accessible at `/admin` (Default PIN: `sonic2026`, customizable in settings).
- **Site Branding & Content CMS**: Change site title, logo, header announcement marquee ticker, hero banner image, and payment numbers directly from the browser.
- **Game Catalog Manager (CRUD)**: Create, edit, and delete games with custom input fields, badges, delivery speeds, and posters.
- **Packages & Pricing Engine**: Add, edit, and delete package tiers per game, update prices in BDT (৳), and toggle In Stock / Out of Stock status with 1 click.
- **Promo Codes & Coupons Manager**: Create and manage discount tickets with min-spend thresholds and active/inactive toggles.
- **Orders Hub**: Live order filtering, search by Order ID / WhatsApp / TrxID, 1-click status transitions, and customer credential inspection.
- **Chronological Audit History Log**: Tracks every administrative modification (create, update, delete, status change) with timestamps and author attribution.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (Turbopack, App Router)
- **UI & Theming**: Tailwind CSS v4, HeroUI, Lucide React
- **Animation**: Framer Motion
- **Database**: MongoDB (with Mongoose / native driver & local JSON file-based fallback)
- **Cloud & Auth**: Firebase Authentication & Storage
- **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for MongoDB / Firebase)
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Configure your MongoDB connection string and Firebase API keys if desired. The application includes a self-healing persistent JSON store (`data/store.json`) so it runs completely out-of-the-box even without external cloud services.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 👨‍💻 Author & Credits
- **Developer**: [md-asif-iqbal](https://github.com/saikat01733) (`md.asifiqbal2008@gmail.com`)
- **Project**: Sonic's E-Shop
