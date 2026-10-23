---
doc: spec
status: approved
---

# Dawa Equips Marketplace PoC — Technical Spec

## How This Works, In Plain Language

Dawa Equips is split into three connected parts:
1. **A React + TypeScript Frontend (`client/`, hosted on Vercel):** Renders both the buyer storefront and the vendor portal (`vendor.<hostname>` or `/vendor`). It uses `shadcn/ui` and Tailwind CSS styled in the "Espresso Haute" palette (`#FDFBF7` warm alabaster, `#1A1110` espresso brown, `#D4AF37` brushed brass, `#9CAF88` sage green).
2. **An Express + TypeScript API Server (`server/`, hosted on Render.com):** Handles catalog filtering, multi-step product creation, CSV bulk imports, promotion publishing, order lifecycle transitions, invoice generation, Resend email dispatch, and a real-time Server-Sent Events (`GET /api/events`) stream.
3. **A NeonDB PostgreSQL Database (managed with Drizzle ORM):** Persists products (with Base64/URL image arrays), active promotions, customer orders, invoices, and recorded email notifications so nothing is lost when a buyer or vendor closes the browser.

Why this shape: Keeping images as Base64/URLs inside Postgres, using native Server-Sent Events (`/api/events`) for live promotion/order broadcasts, and recording every email notification in the database alongside Resend means the entire marketplace loop works out of the box locally and in production without extra cloud buckets or WebSocket infrastructure.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. **Storefront Arrival & Live Connection:** A visitor opens the React storefront (`/`). The app fetches `GET /api/products?status=ACTIVE` and `GET /api/promotions?active=true` from Express (queried via Drizzle from NeonDB) and opens a persistent `EventSource('/api/events')` connection so any vendor promotion or stock change updates on screen immediately.
2. **Discovery & Filtering:** As the buyer types a search keyword or filters by category, brand, or price range, the storefront filters the catalog and renders Product Cards showing the primary image, rating, price, discount percentage (`percentageDiff` when `initialPrice > price`), and on-hover **Add to Cart** CTA.
3. **Product Inspection:** Clicking a card opens the **Product Detail View**, displaying the 3+ image gallery, brand, rating, active promotion badge, variant selector, stock count, and technical specifications. Clicking **Add to Cart** saves the line item in browser `localStorage` (`dawa_cart`) and updates the header badge.
4. **Checkout & Draft Invoice Creation:** The buyer fills out `Buyer Name`, `Buyer Phone`, `Buyer Email`, and `Delivery Note` and clicks **Confirm Order**. The frontend sends `POST /api/orders`. Express runs a Drizzle transaction that creates an `orders` row (`stage: 'OrderInitiation'`), creates a linked `invoices` row (`status: 'DRAFT'`), triggers a Resend email (and writes a copy to `email_logs`), broadcasts `order:updated` over SSE, and returns the generated **Order Invoice** to display immediately.
5. **Vendor Catalog & Instant Promo Setup:** The retailer opens `vendor.<hostname>` (or `/vendor`). They create a product via the 4-step dialog (`POST /api/products` with 3+ Base64 images) or upload a CSV (`POST /api/products/import-csv`, which stores rows with fewer than 3 images as `PENDING_IMAGES` until edited). In **Promotions**, selecting a banner template and product sends `POST /api/promotions`, which updates the product's `price`/`initialPrice` in Postgres and broadcasts `promo:updated` over `GET /api/events`—instantly rendering the new Flash Sale / Seasonal Deal banner on open buyer tabs.
6. **Vendor Order Fulfillment & Stock Deduction:** When the vendor clicks an `OrderInitiation` order in **Orders**, the frontend calls `PATCH /api/orders/:id/stage` with `stage: 'OrderReceived'`. As they coordinate delivery and mark it `OrderProcessed` and then `OrderDelivered`, Express updates the linked invoice from `DRAFT` to `PAID`, deducts item quantities from `products.stock` (flagging `OUT_OF_STOCK` and alerting the vendor if stock reaches `0`), sends/records the status email, and pushes an SSE update.
7. **Buyer Order Tracking:** The buyer opens **Track Order**, enters their phone number (`GET /api/orders/track?phone=...`), and views their lifetime orders, the 5-stage progress bar, the `DRAFT`/`PAID` invoice table, and a preview log of all status emails sent to them.

## Stack

- **Frontend Framework:** [React 18](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) — fast local dev server and clean static/SPA deployment to Vercel.
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/docs) + [shadcn/ui](https://ui.shadcn.com/docs) (Radix UI primitives + Lucide icons) — accessible dialogs, tabs, drawers, and tables customized with the "Espresso Haute" palette and Google Fonts (`Cormorant Garamond`, `Montserrat`/`Futura`, `Inter`).
- **Backend Runtime & API:** [Node.js](https://nodejs.org/en/docs) + [Express](https://expressjs.com/) + TypeScript (`tsx`) — lightweight REST API plus native Server-Sent Events (`text/event-stream`) deployable as a single web service on Render.com.
- **Database & ORM:** [NeonDB Serverless PostgreSQL](https://neon.tech/docs/introduction) + [Drizzle ORM](https://orm.drizzle.team/docs/overview) (`drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless` / `pg`) — learner-chosen type-safe SQL schema, migrations, and transactional updates for promotions, orders, and invoices.
- **Email Service:** [Resend Node SDK](https://resend.com/docs/send-with-nodejs) (`resend`) — sends transactional order status emails, paired with an in-database `email_logs` fallback so every sent email can also be previewed directly inside the app.
- **CSV Parsing:** [PapaParse](https://www.papaparse.com/docs) (`papaparse`) — parses bulk product CSV files cleanly before sending structured rows to Express.

## Where It Runs and How Someone Tries It

- **Runtime & Environment Requirements:**
  - Node.js 20+ and npm.
  - Environment variables in `.env`:
    - `DATABASE_URL` — NeonDB PostgreSQL connection string (required).
    - `RESEND_API_KEY` — Resend API key for live emails (optional; if omitted or using Resend's sandbox domain, emails are still recorded in `email_logs` and previewable in the UI).
    - `PORT` — Express server port (defaults to `4000`).
    - `VITE_API_URL` — Backend URL for the React frontend (defaults to `http://localhost:4000` locally).
- **Local Start Commands (for Development & Demo Video Recording):**
  1. `npm install` — installs workspace dependencies.
  2. `npm run db:push && npm run db:seed` — pushes the Drizzle schema to NeonDB and seeds sample refurbished commercial espresso machines and an active Flash Sale banner.
  3. `npm run dev` — starts both the Express API (`http://localhost:4000`) and Vite frontend (`http://localhost:5173`).
  4. **What to Open:**
     - **Buyer Storefront:** `http://localhost:5173`
     - **Vendor Admin Portal:** `http://vendor.localhost:5173` or `http://localhost:5173/vendor`
- **Hackathon Submission Reminder:** Submission requires a **short demo video** and a **public GitHub repository**. Deployment is optional and does not replace the video.
- **Optional Production Deployment (Chosen by Learner):**
  - **Frontend on [Vercel](https://vercel.com/docs):** Connect the GitHub repo, set root/build to the client build output, set `VITE_API_URL` to the Render service URL, and include a `vercel.json` rewrite so `/vendor` and `vendor.*` load the SPA cleanly.
  - **Backend on [Render.com](https://render.com/docs/web-services):** Connect the GitHub repo, set `DATABASE_URL` and `RESEND_API_KEY` in Render environment variables, build command `npm install && npm run build:server`, start command `npm run start:server`.

## Look and Feel

Implements `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Color Tokens ("Espresso Haute" configured in Tailwind & CSS variables):**
  - `--bg-alabaster`: `#FDFBF7` (Primary background base, gallery-like warmth for appliance photography)
  - `--text-espresso`: `#1A1110` (Primary text, structural borders, and dark editorial surfaces)
  - `--accent-brass`: `#D4AF37` (Primary CTA buttons, discount badges, active sidebar highlights, star ratings)
  - `--accent-sage`: `#9CAF88` (In-stock badges, order progress indicators, trust tags)
- **Typography:**
  - **Display / Headings (`font-serif`):** `Cormorant Garamond` (bold, high-contrast editorial serif for hero banners, page titles, and modal headers).
  - **Navigation & Category Tags (`font-display-sans`):** `Futura` (with `Montserrat` geometric fallback), uppercase (`tracking-widest`) for category pills, table headers, and status badges.
  - **Body & Technical Specs (`font-sans`):** `Inter` with `leading-relaxed` (`line-height: 1.6`) for specification tables, descriptions, and invoices.
- **Density & Tone:** Jumia-inspired promotional energy (hero deal banners, clear discount math, filterable multi-column grid) elevated with boutique gallery spacing and authoritative commercial equipment specifications.

## Components

### 1. Hostname & Route Shell (`AppRouter`)
Inspects `window.location.hostname` (checking for `vendor.*`) and the URL pathname (`/vendor`). Renders either the **Storefront Layout** or the **Vendor Admin Portal Layout**, plus a subtle top-corner PoC view-switcher pill so the demo can jump between Buyer and Vendor views in one click.
Implements `prd.md > Screens and Layout` and `prd.md > States and Boundaries`.

### 2. Storefront Header, Promo Hero & Catalog Grid (`StorefrontHome`)
Renders the top navigation bar (brand logo, all-caps category links, search input, **Track Order** trigger, and **Cart** badge), the live **Promo Banner Carousel/Hero** (Flash Sales & Seasonal Deals), sidebar/top filter controls (Category, Brand, Price Range), and the responsive grid of **Product Cards** (`productImage`, `productName`, `ratingValue`, `price`, `initialPrice`, `percentageDiff` badge, on-hover `Add to Cart` CTA, and `Out of Stock` disabled state when `stock === 0`). Subscribes to `GET /api/events` (SSE) so newly published promotions and stock changes update live on screen.
Implements `prd.md > 1. Storefront Discovery, Search, and Filtering`.

### 3. Product Detail Gallery & Specs View (`ProductDetailDialog`)
Displays the interactive 3+ image gallery (switching the main preview image on thumbnail click), `productName`, `brand`, `ratingValue`, active promotion callout badge, variant selector, live stock count, full technical specifications table, long-form condition description, and `Add to Cart` button.
Implements `prd.md > 2. Product Detail Gallery and Specifications`.

### 4. Cart Drawer, Checkout Form & Invoice Modal (`CartAndCheckout`)
Manages cart items and quantities in `localStorage`, computes the running total, and collects `Buyer Name`, `Buyer Phone`, `Buyer Email`, and `Delivery Note`. Submitting calls `POST /api/orders` and immediately transitions to the printable/viewable **Order Invoice View** showing the **Products Bought vs. Price Table**, buyer contact details, and `DRAFT` invoice status badge.
Implements `prd.md > 3. Cart, Checkout, and Draft Invoice Generation`.

### 5. Buyer Order Tracking & Email Preview View (`OrderTrackerView`)
Provides a phone-number search input (`GET /api/orders/track?phone=...`) that lists all lifetime orders for that buyer, renders the 5-stage visual progress bar (`OrderInitiation`, `OrderReceived`, `OrderProcessed`, `OrderDelivered`, `OrderCancelled`), displays the linked **Order Invoice** (`DRAFT` or `PAID`), and shows the recorded email notifications sent to the buyer's email address. Listens to `GET /api/events` so stage transitions made by the vendor reflect live.
Implements `prd.md > 4. Buyer Phone Lookup, Order Lifecycle Tracking, and Email Updates`.

### 6. Vendor Sidebar & Products Manager (`VendorProductsView`)
Renders the persistent 4-item vendor sidebar (**Orders**, **Products**, **Promotions**, **Invoices**) with an out-of-stock alert banner whenever any product has `stock === 0`. Inside **Products**, displays the inventory table alongside:
- **Multi-Step Product Dialog (`ProductMultiStepModal`):** 4 validated steps — (1) Name, Brand, Category; (2) Variants, Price, Initial Price, Stock Count; (3) Technical Specifications & Description; (4) Upload/attach minimum 3 images (converted to Base64 or URL strings).
- **CSV Bulk Import (`CsvImportModal`):** Parses a CSV file via PapaParse and sends rows to `POST /api/products/import-csv` without requiring 3 images in the CSV; imported rows without 3 images are labeled `Needs 3+ Images` (`status: 'PENDING_IMAGES'`) until completed in the multi-step editor.
Implements `prd.md > 5. Vendor Product Management (Multi-Step Form & CSV Bulk Import)`.

### 7. Vendor Promotions & Instant Banner Builder (`VendorPromotionsView`)
Lets the vendor choose from predefined banner design templates (e.g., *Espresso Gold Flash Sale*, *Sage Harvest Seasonal Deal*, *Noir Showroom Spotlight*), select an existing product from inventory, enter promotion headline and discount price, and publish via `POST /api/promotions`. Updates the product's discount pricing and broadcasts `promo:updated` over SSE to update the storefront immediately.
Implements `prd.md > 6. Vendor Promotions & Banner Builder`.

### 8. Vendor Orders & Invoices Manager (`VendorOrdersView` & `VendorInvoicesView`)
- **Orders View:** Lists all customer orders. Clicking to open an order in `OrderInitiation` automatically calls `PATCH /api/orders/:id/stage` to set `OrderReceived`. Provides stage buttons for `OrderProcessed`, `OrderDelivered`, and `OrderCancelled`. When `OrderDelivered` is triggered, the backend marks the invoice `PAID` and decrements product stock.
- **Invoices View:** Displays all generated invoices with their **Products vs. Price Table**, buyer contact details, delivery notes, and status (`DRAFT`, `PAID`, or `CANCELLED`).
Implements `prd.md > 7. Vendor Orders and Invoice Management`.

### 9. Express API, Drizzle Data Layer & SSE Hub (`server/`)
Exposes REST endpoints under `/api/*`, manages the Drizzle ORM connection to NeonDB Postgres, dispatches order status emails via Resend while saving every email to `email_logs`, and maintains connected SSE clients on `GET /api/events` to broadcast `promo:updated`, `product:updated`, and `order:updated` events.
Implements `prd.md > Features and Behavior` (all backend operations).

## Data Model

Managed in NeonDB PostgreSQL via **Drizzle ORM** (`server/db/schema.ts`):

1. **`products` table:**
   - `id` (serial / UUID primary key)
   - `name` (text, not null)
   - `brand` (text, not null)
   - `category` (text, not null — e.g., `'Commercial Espresso Machines'`, `'Grinders'`, `'Ovens & Dishwashers'`, `'Spare Parts'`)
   - `price` (numeric/integer, not null — current selling price)
   - `initialPrice` (numeric/integer, nullable — original price prior to discount)
   - `ratingValue` (real, default `4.8`)
   - `variants` (jsonb — array of `{ name: string, price?: number }`, e.g., `["2-Group Head", "3-Group Head"]`)
   - `stock` (integer, not null, default `1`)
   - `specifications` (jsonb — key-value pairs of technical specs like Boiler Capacity, Voltage, Power)
   - `description` (text, not null)
   - `images` (jsonb / text array — Base64 data URLs or image URLs; minimum 3 required for `ACTIVE` status)
   - `status` (text — `'ACTIVE' | 'PENDING_IMAGES' | 'OUT_OF_STOCK'`)
   - `createdAt` (timestamp)
2. **`promotions` table:**
   - `id` (serial primary key)
   - `title` (text, not null)
   - `subtitle` (text)
   - `promoType` (text — `'FLASH_SALE' | 'SEASONAL_DEAL'`)
   - `templateId` (text — `'espresso-gold' | 'sage-editorial' | 'brass-spotlight'`)
   - `productId` (integer, foreign key → `products.id`)
   - `promoPrice` (numeric/integer, not null)
   - `isActive` (boolean, default `true`)
   - `createdAt` (timestamp)
3. **`orders` table:**
   - `id` (serial primary key)
   - `orderNumber` (text, unique — e.g., `'ORD-1001'`)
   - `buyerName` (text, not null)
   - `buyerPhone` (text, not null, indexed for phone lookup)
   - `buyerEmail` (text, not null)
   - `deliveryNote` (text, not null)
   - `items` (jsonb — array of `{ productId, productName, variant, quantity, unitPrice, lineTotal }`)
   - `totalAmount` (numeric/integer, not null)
   - `stage` (text — `'OrderInitiation' | 'OrderReceived' | 'OrderProcessed' | 'OrderDelivered' | 'OrderCancelled'`)
   - `createdAt` / `updatedAt` (timestamp)
4. **`invoices` table:**
   - `id` (serial primary key)
   - `invoiceNumber` (text, unique — e.g., `'INV-1001'`)
   - `orderId` (integer, foreign key → `orders.id`)
   - `status` (text — `'DRAFT' | 'PAID' | 'CANCELLED'`)
   - `issuedAt` / `paidAt` (timestamp)
5. **`email_logs` table:**
   - `id` (serial primary key)
   - `orderId` (integer, foreign key → `orders.id`)
   - `recipientEmail` (text, not null)
   - `subject` (text, not null)
   - `body` (text, not null)
   - `deliveryStatus` (text — `'SENT_VIA_RESEND' | 'RECORDED_IN_APP'`)
   - `sentAt` (timestamp)

**Browser State (`localStorage`):**
- `dawa_cart`: Active shopping cart items before checkout; cleared once an order is confirmed.

## File Structure

```
dawa-equipsV2.0/
├── client/                              # React + Vite + TypeScript + shadcn/ui frontend
│   ├── index.html                       # Loads Google Fonts (Cormorant Garamond, Montserrat, Inter)
│   └── src/
│       ├── main.tsx                     # React entry point
│       ├── App.tsx                      # Hostname (vendor.*) & /vendor router + SSE listener
│       ├── index.css                    # Tailwind CSS + "Espresso Haute" theme variables
│       ├── lib/
│       │   ├── api.ts                   # Typed fetch helpers & EventSource (/api/events) hook
│       │   └── utils.ts                 # Discount percentage math, currency formatting, cn()
│       ├── components/
│       │   ├── storefront/
│       │   │   ├── StorefrontHeader.tsx # Nav, search, category links, Track Order & Cart buttons
│       │   │   ├── PromoBannerHero.tsx  # Live Flash Sale / Seasonal Deal banners
│       │   │   ├── ProductCard.tsx      # Image, rating, discount math, hover Add to Cart, Out of Stock
│       │   │   ├── ProductDetailModal.tsx # 3+ image gallery, specs table, variant & stock display
│       │   │   ├── CartCheckoutDrawer.tsx # Cart items, buyer form, Draft Invoice confirmation
│       │   │   └── OrderTrackerModal.tsx  # Phone lookup, 5-stage progress bar, invoice & email log
│       │   ├── vendor/
│       │   │   ├── VendorLayout.tsx     # Left sidebar (Orders, Products, Promotions, Invoices) + alerts
│       │   │   ├── VendorOrdersView.tsx # Auto-OrderReceived on open + stage progression buttons
│       │   │   ├── VendorProductsView.tsx # Inventory table, out-of-stock badges, Pending Images filter
│       │   │   ├── ProductMultiStepModal.tsx # 4-step create/edit form with 3+ Base64 image uploader
│       │   │   ├── CsvImportModal.tsx   # CSV upload without 3-image requirement
│       │   │   ├── VendorPromotionsView.tsx # Predefined banner design picker + live promo publisher
│       │   │   └── VendorInvoicesView.tsx # Products-vs-Price invoice table & DRAFT/PAID status
│       │   └── shared/
│       │       └── InvoiceDocument.tsx  # Shared printable/viewable Invoice table for buyer & vendor
├── server/                              # Express + TypeScript + Drizzle ORM backend
│   ├── index.ts                         # Express app, CORS, JSON body limit (25mb for Base64), routes
│   ├── sse.ts                           # Server-Sent Events (/api/events) client registry & broadcaster
│   ├── email.ts                         # Resend SDK integration + email_logs database recorder
│   ├── db/
│   │   ├── index.ts                     # NeonDB Postgres connection & Drizzle instance
│   │   ├── schema.ts                    # Drizzle tables: products, promotions, orders, invoices, email_logs
│   │   └── seed.ts                      # Pre-seeds commercial coffee machines & active Flash Sale
│   └── routes/
│       ├── products.ts                  # GET/POST/PATCH products + POST /import-csv
│       ├── promotions.ts                # GET/POST/PATCH promotions + atomic product price update + SSE
│       └── orders.ts                    # POST order + GET track by phone + PATCH stage/stock/invoice
├── devpost/                             # Devpost planning & learning artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── drizzle.config.ts                    # Drizzle Kit configuration for NeonDB
├── package.json                         # Scripts for dev, build, db:push, and db:seed
├── tsconfig.json
└── vercel.json                          # SPA rewrites for Vercel deployment
```

## External Services and Dependencies

1. **NeonDB Serverless PostgreSQL ([Docs](https://neon.tech/docs/introduction)):**
   - **Connection:** Standard `DATABASE_URL` Postgres connection string via `@neondatabase/serverless` / `pg` and `drizzle-orm`.
   - **Cost & Limits:** Free tier includes 0.5 GB storage and autoscaling compute—more than enough for PoC catalog, Base64 product thumbnails, orders, and invoices.
2. **Resend Email API ([Docs](https://resend.com/docs/api-reference/emails/send-email)):**
   - **Endpoint:** `POST https://api.resend.com/emails` (via `resend.emails.send({ from, to, subject, html })`).
   - **Payload & Response:** Sends order stage updates (`OrderInitiation`, `OrderReceived`, `OrderProcessed`, `OrderDelivered`, `OrderCancelled`) to `buyerEmail`; returns `{ id }` on success.
   - **Keys & Limits:** Requires `RESEND_API_KEY` (Free tier: 100 emails/day; without a custom domain, Resend only sends to the account owner's email, which is why every email is also saved to `email_logs` for in-app preview).
3. **Vercel ([Docs](https://vercel.com/docs)) & Render.com ([Docs](https://render.com/docs)):**
   - Optional free-tier hosting targets for the React SPA and Express API respectively.

## Important Failure Modes

- **Base64 Image Payloads Exceed Default Express Body Limit:** Uploading 3+ product images as Base64 strings can exceed Express's default `100kb` JSON limit → Configure `express.json({ limit: '25mb' })` and compress/resize uploaded images client-side on an HTML `<canvas>` (max 1000px width, JPEG quality `0.8`) before Base64 encoding so uploads stay fast and small in NeonDB.
- **Resend Sandbox Restriction or Missing `RESEND_API_KEY`:** Resend's free sandbox domain (`onboarding@resend.dev`) rejects emails addressed to arbitrary unverified buyer emails → Wrap `resend.emails.send` in a `try/catch` that always writes the formatted email to the `email_logs` table (`deliveryStatus: 'SENT_VIA_RESEND'` or `'RECORDED_IN_APP'`) and surfaces an in-app email preview in the Order Tracker and Vendor Orders views.
- **CSV Upload With Missing Columns or Fewer Than 3 Images:** Vendor uploads a CSV with incomplete image columns → Parser fills defaults for optional fields, imports the products with `status: 'PENDING_IMAGES'`, hides them from the buyer storefront, and highlights them with a `Needs 3+ Images` badge in the Vendor Products table so the vendor can attach images via the edit dialog.

## What Was Simplified and Why

- **Base64 Images in Postgres Instead of S3/Cloudinary Object Storage:** Chosen by the learner so adding 3+ product images in the multi-step form works with zero third-party storage keys or CORS bucket policies. Client-side canvas compression keeps row sizes small.
- **Server-Sent Events (`GET /api/events`) Instead of WebSockets/Socket.io:** Chosen with the learner to push instant Flash Sale / Seasonal Deal promotion updates and order stage changes from Express to open buyer tabs using native browser `EventSource` and standard HTTP.
- **Dual Resend + In-App Email Log Instead of Mandatory Custom DNS SMTP:** Allows real email dispatch via Resend while guaranteeing that every order status email can be inspected on screen during the demo regardless of recipient email address.
- **Hostname Detection (`vendor.*`) + `/vendor` Route Fallback + Demo Switcher:** Lets the vendor portal work on a subdomain (`vendor.localhost:5173`) *and* on a single local or Vercel URL (`/vendor`) without requiring custom domain DNS setup before recording the demo.

## Decisions and Open Issues

- **Learner Decisions:**
  - **Stack & Hosting:** React + TypeScript + `shadcn/ui` frontend (Vercel), Express backend (Render.com), and NeonDB PostgreSQL managed with **Drizzle ORM**.
  - **Image Storage:** Store the 3+ product images directly in Postgres as Base64 strings (with URL support for seeded items and CSV imports).
  - **Email Notifications:** Use **Resend** paired with in-app message recording and preview.
  - **Vendor Portal Routing:** Support `/vendor` as a fallback route alongside `vendor.<hostname>` detection.
- **Learner Focus Area / Uncertainty Explored ("Instant Product Promotions"):**
  - *Question / Focus:* How to make vendor updates to a Flash Sale or Seasonal Deal banner reflect immediately for buyers on the storefront.
  - *Resolution:* When the vendor publishes or updates a promotion in `POST /api/promotions`, Express runs a Drizzle transaction that saves the promotion banner and updates the linked product's `price` and `initialPrice`, then broadcasts a `promo:updated` event over native Server-Sent Events (`GET /api/events`). Connected buyer storefronts listening via `new EventSource('/api/events')` automatically refresh the hero banner and product cards without a page reload.
- **Open Issues:**
  - None blocking `5-build`. During step 1 of the build, we will verify the `DATABASE_URL` connection to NeonDB and confirm Express's `25mb` JSON payload limit for Base64 images.
