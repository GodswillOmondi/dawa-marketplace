---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Browse the pre-seeded "Espresso Haute" storefront, filter deals, and inspect 3+ image product specs**
  Becomes usable: Visitors can open the Dawa Equips storefront styled in the "Espresso Haute" palette, see active Flash Sale and Seasonal Deal hero banners and pre-seeded refurbished commercial appliances loaded from NeonDB PostgreSQL, filter by keyword, category, brand, or price range, and click any product card to inspect its 3+ image gallery, variant selector, stock availability, and technical specifications table.
  Why now: Bootstraps the React + Vite + Tailwind + Express + Drizzle stack inside the first usable slice and immediately proves the database schema, seeded catalog, and the core trust kernel (structured commercial equipment specs, multi-image inspection, and deal visibility) before adding write flows.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Look and Feel`, `prd.md > 1. Storefront Discovery, Search, and Filtering`, `prd.md > 2. Product Detail Gallery and Specifications`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components` (`1. Hostname & Route Shell`, `2. Storefront Header, Promo Hero & Catalog Grid`, `3. Product Detail Gallery & Specs View`, `9. Express API, Drizzle Data Layer & SSE Hub`), `spec.md > Data Model`, `spec.md > File Structure`
  Build: Scaffold the workspace (`package.json`, `tsconfig.json`, Vite + React + Tailwind CSS configured with the "Espresso Haute" tokens `#FDFBF7`, `#1A1110`, `#D4AF37`, `#9CAF88` and Google Fonts `Cormorant Garamond`, `Montserrat`, `Inter`), set up the Express + Drizzle ORM schema (`server/db/schema.ts`, `server/db/index.ts`, `server/db/seed.ts`), seed commercial coffee machines (each with 3+ images, technical specs, ratings, and an out-of-stock item) plus active Flash Sale and Seasonal Deal banners, implement `GET /api/products` and `GET /api/promotions`, and build `AppRouter`, `StorefrontHeader`, `PromoBannerHero`, catalog filters, `ProductCard`, and `ProductDetailModal`.
  Verify (mechanical): Run `npm run db:push && npm run db:seed`, start the dev server, query `GET /api/products` and `GET /api/promotions` to confirm seeded products (with 3+ images and discount math) and active promotions return HTTP 200, and verify the frontend builds with zero TypeScript errors.
  Learner check: Open the storefront (`http://localhost:5173`), click an active Flash Sale banner, filter the catalog by category/brand/price, and click a product card to inspect its 3+ image gallery and technical specifications table.
  Commit: `Add seeded Espresso Haute storefront, filters, and product detail gallery`

- [x] **2. Vendor publishes products (4-step Base64 form & CSV bulk import) and broadcasts instant promo banners via SSE**
  Becomes usable: The retailer can open the Vendor Admin Portal (`vendor.localhost:5173` or `/vendor`), create or edit products via the 4-step dialog (with 3+ compressed Base64/URL images), bulk-import products via CSV (holding rows with fewer than 3 images as `Needs 3+ Images` until completed), and publish predefined Flash Sale / Seasonal Deal banners that immediately appear on open buyer storefront tabs via Server-Sent Events (`GET /api/events`) while updating the linked product's discount pricing.
  Why now: Tackles the highest technical risks and your primary architecture focus early — 25MB Base64 image payloads, the two-stage CSV 3-image rule, transactional Drizzle promotion price updates, and live Server-Sent Events broadcasting (`promo:updated`, `product:updated`).
  PRD ref: `prd.md > The Core Journey` (step 5), `prd.md > 5. Vendor Product Management (Multi-Step Form & CSV Bulk Import)`, `prd.md > 6. Vendor Promotions & Banner Builder`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (`6. Vendor Sidebar & Products Manager`, `7. Vendor Promotions & Instant Banner Builder`, `9. Express API, Drizzle Data Layer & SSE Hub`), `spec.md > Important Failure Modes`, `spec.md > Decisions and Open Issues`
  Build: Implement `server/sse.ts` (`GET /api/events`), configure `express.json({ limit: '25mb' })`, add `POST /api/products`, `PATCH /api/products/:id`, `POST /api/products/import-csv`, and `POST /api/promotions` (transactional banner creation + product `price`/`initialPrice` update + SSE broadcast). Build `VendorLayout` (with 4-item sidebar and low/zero-stock alert banner), `VendorProductsView`, `ProductMultiStepModal` (4 validated steps with client-side canvas compression to Base64), `CsvImportModal` (PapaParse upload saving `< 3` image rows as `PENDING_IMAGES`), `VendorPromotionsView` (predefined banner templates), and connect `EventSource('/api/events')` on the storefront.
  Verify (mechanical): Test `POST /api/products` with 3 Base64 images, `POST /api/products/import-csv` with incomplete images (verifying `status: 'PENDING_IMAGES'` is excluded from active storefront queries until 3 images are attached), and `POST /api/promotions` while subscribed to `GET /api/events` to confirm `promo:updated` fires immediately and updates the product's discount pricing.
  Learner check: Open `/vendor` (or `vendor.localhost:5173`), import a CSV to see rows flagged `Needs 3+ Images`, edit a product in the 4-step modal to attach 3+ images so it goes live, and publish a new Flash Sale or Seasonal Deal banner in Promotions to watch it appear live on the storefront with updated discount math.
  Commit: `Add vendor product manager, CSV import, and live SSE promotion builder`

- [x] **3. Buyer adds appliances to cart, completes checkout, and receives a printable `DRAFT` Order Invoice**
  Becomes usable: Buyers can add commercial appliances and selected variants to a persistent cart (`localStorage`), adjust quantities, fill in `Buyer Name`, `Buyer Phone`, `Buyer Email`, and `Delivery Note`, and confirm their order to immediately view/print an itemized **Order Invoice** (`status: 'DRAFT'`) with a Products Bought vs. Price table while an `OrderInitiation` order and email log are saved.
  Why now: Connects storefront discovery and promotions to the invoice-first purchase workflow and establishes the `orders`, `invoices`, and `email_logs` records needed for vendor fulfillment and buyer tracking.
  PRD ref: `prd.md > The Core Journey` (step 4), `prd.md > 3. Cart, Checkout, and Draft Invoice Generation`, `prd.md > Product Decisions`
  Spec ref: `spec.md > Components` (`4. Cart Drawer, Checkout Form & Invoice Modal`, `9. Express API, Drizzle Data Layer & SSE Hub`), `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Implement `server/email.ts` (Resend SDK email dispatch wrapped with guaranteed fallback recording in `email_logs`), `POST /api/orders` (Drizzle transaction creating the `OrderInitiation` order, linked `DRAFT` invoice, and initial email log, plus SSE `order:updated` broadcast), `CartCheckoutDrawer.tsx` (`dawa_cart` persistence in `localStorage`, quantity controls, required buyer fields), and shared `InvoiceDocument.tsx` rendering the Products Bought vs. Price table, buyer contact details, and invoice status badge.
  Verify (mechanical): Send `POST /api/orders` with sample line items and buyer contact fields, and confirm HTTP 201 returns the created order (`stage: 'OrderInitiation'`), linked invoice (`status: 'DRAFT'`), and recorded email notification in `email_logs`.
  Learner check: Add two products to the cart on the storefront, adjust quantities, submit the checkout form with your contact and meetup note, and inspect the generated `DRAFT` Order Invoice table.
  Commit: `Add cart drawer, checkout flow, and draft order invoice generation`

- [x] **4. Vendor fulfills orders (`OrderReceived` to `OrderDelivered` / `PAID` invoice & stock deduction) and buyer tracks progress by phone**
  Becomes usable: When the vendor opens an `OrderInitiation` order in Vendor Orders, it automatically transitions to `OrderReceived`; stepping it through `OrderProcessed` to `OrderDelivered` flips the linked invoice from `DRAFT` to `PAID`, deducts ordered quantities from product stock (triggering out-of-stock badges and vendor alerts if stock hits `0`), records/sends status emails, and updates the Buyer **Track Order** phone lookup view and 5-stage progress bar live.
  Why now: Completes the full marketplace loop — linking vendor order fulfillment and inventory depletion directly to invoice completion, email notifications, and buyer phone-number order tracking.
  PRD ref: `prd.md > The Core Journey` (steps 6–7), `prd.md > 4. Buyer Phone Lookup, Order Lifecycle Tracking, and Email Updates`, `prd.md > 7. Vendor Orders and Invoice Management`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (`5. Buyer Order Tracking & Email Preview View`, `8. Vendor Orders & Invoices Manager`), `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Implement `GET /api/orders`, `GET /api/orders/track?phone=...`, `GET /api/invoices`, and `PATCH /api/orders/:id/stage` (handling automatic `OrderReceived` on open, `OrderProcessed`, `OrderCancelled` → invoice `CANCELLED`, and `OrderDelivered` → invoice `PAID` + stock deduction + `OUT_OF_STOCK` status update + Resend/in-app email log + SSE broadcast). Build `VendorOrdersView.tsx`, `VendorInvoicesView.tsx`, and `OrderTrackerModal.tsx` (phone lookup input, 5-stage visual progress bar, expandable invoice view, and sent email notification log).
  Verify (mechanical): Query an `OrderInitiation` order, step it via `PATCH /api/orders/:id/stage` through `OrderReceived` → `OrderProcessed` → `OrderDelivered`, and verify via `GET /api/orders/track?phone=...` and `GET /api/invoices` that the order stage is `OrderDelivered`, the invoice is `PAID`, product stock decremented (marking `OUT_OF_STOCK` when `0`), and `email_logs` captured every status email.
  Learner check: Open a newly placed order in the Vendor Portal to see it auto-advance to `OrderReceived`, step it to `OrderDelivered`, verify the invoice is marked `PAID` and stock decremented, then enter the buyer's phone number in the storefront's **Track Order** modal to see the 5-stage progress tracker, `PAID` invoice, and email notification history.
  Commit: `Add vendor order fulfillment, invoice completion, and buyer phone order tracking`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after Slice 2 (storefront catalog/filters, vendor 4-step & CSV product creation, and live SSE promo banner publishing)
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused activity offered around the delivery process, connecting Slice 4's planned verification to `server/routes/orders.ts` and `client/src/components/storefront/OrderTrackerModal.tsx`; learner response pending.
Route and stops: Reference only — `client/src/components/storefront/CartCheckoutDrawer.tsx` (`handleSubmitOrder`), `client/src/lib/api.ts` (`createOrder`, `trackOrdersByPhone`), `server/routes/orders.ts` (order creation and stage update); buyer tracking in `client/src/components/storefront/OrderTrackerModal.tsx`.
Edit outcome: Not applicable to the focused activity.
Reflection: Pending learner response; not yet offered.
Activity mode: Focused alternative; app map is a static offline reference.

## Revisions
