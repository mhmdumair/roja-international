# 🎨 Roja International — Colour Store

Production-ready Next.js 14 e-commerce site for Sri Lankan colour powders & household essentials.
**Orders via WhatsApp + Email · Pay on delivery · No online payment.**

---

## Pages

| Page | URL | Description |
|---|---|---|
| Home | `/` | Hero slider, categories, featured products, reviews |
| Products | `/products` | All products with filter & sort. **Click a card → full-screen popup with images, order form & reviews** |
| About Us | `/about` | Story, stats, website reviews (customers can write reviews here) |
| Contact Us | `/contact` | Contact info, WhatsApp CTA button, message form |
| Checkout | `/checkout` | Order form with WhatsApp / Email submission |
| Order Confirmed | `/order-confirmed` | Success page with confetti |
| Admin | `/admin` | Password-protected dashboard |

---

## Quick Start

```bash
# 1. Install (no flags needed — all deps pre-resolved)
npm install

# 2. Setup environment
cp .env.example .env
# Fill in your credentials (see below)

# 3. Hash admin password
npx ts-node scripts/hashPassword.ts

# 4. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 5. Push database schema
npm run db:push

# 6. Start
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin *(also linked in footer)*

---

## Service Setup

### MongoDB Atlas (free)
1. [mongodb.com/atlas](https://mongodb.com/atlas) → Create cluster → Connect → copy URI
2. Replace `<USER>:<PASS>` and paste as `DATABASE_URL`

### Cloudinary (free)
1. [cloudinary.com](https://cloudinary.com) → Dashboard → copy credentials
2. Settings → Upload Presets → Add preset:
   - Name: `store_products`, Mode: **Unsigned**, Folder: `store/products`
3. Fill `NEXT_PUBLIC_CLOUDINARY_*` and `CLOUDINARY_*` in `.env`

### Resend (free tier)
1. [resend.com](https://resend.com) → Add domain → Create API key
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `STORE_OWNER_EMAIL`

### WhatsApp
- Set `NEXT_PUBLIC_WHATSAPP_NUMBER` = country code + number (e.g. `94771234567`)

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add all env variables
4. Deploy
5. Update `NEXT_PUBLIC_APP_URL` to your live URL

---

## Admin Panel Features

| Feature | Details |
|---|---|
| Dashboard | Revenue chart, order stats, low stock alerts |
| Products | Full CRUD, multi-image Cloudinary upload, toggle active/featured |
| Orders | View all orders, update status, call/WhatsApp customer |
| Reviews | Approve/delete product reviews + site reviews |
| Analytics | Orders & revenue charts by period |
| Settings | Store info, contact, social links, hero images |

**Admin link** is in the website footer (bottom right corner). Click it to reach the login page.

---

## Key Features

- 🛍️ **Product popup** — full-screen with image slider, price, order form, collapsible reviews
- ⭐ **Post-order review** — customers can write a review after placing an order
- 🌐 **About Us reviews** — customers can write general site reviews on the About page
- 📱 **Mobile-first** — bottom nav, touch-optimised, 44px tap targets
- 🎨 **Vibrant design** — colour powder rainbow theme, gradient hero
- 🔒 **Secure admin** — bcrypt password, JWT HttpOnly cookie
- 🗺️ **SEO ready** — metadata per page, sitemap, robots.txt

---

## Tech Stack

| Package | Version |
|---|---|
| Next.js | 14.2.3 |
| React | 18.3.1 |
| Prisma | 5.14.0 |
| Tailwind CSS | 3.4.3 |
| Zustand | 4.5.2 |
| Recharts | 2.12.7 |
| bcryptjs | 2.4.3 |
| jose | 5.3.0 |

`npm install` — **zero flags needed**. All versions pre-resolved.
