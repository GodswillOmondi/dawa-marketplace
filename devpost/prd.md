---
doc: prd
status: approved
---

# Dawa Equips Marketplace PoC — Product Requirements

A Jumia-inspired, editorial-grade web marketplace for refurbished commercial coffee machines and appliances where the retailer ("Dawa Equips") manages inventory, promotions, and invoices via a vendor portal while buyers discover equipment, generate order invoices, and track delivery progress.
Source: `scope.md > Dawa Equips Marketplace PoC`, `scope.md > The Unique Kernel`.

## The Core Journey

1. **Storefront Arrival:** A visitor lands on the Dawa Equips homepage, greeted by active **Flash Sale / Seasonal Deal** promo banners, category navigation, search/filter controls, and a pre-seeded catalog of refurbished commercial appliances styled in the "Espresso Haute" aesthetic.
2. **Discovery & Filtering:** The visitor filters products by category, brand, price range, or search keyword, scanning product cards that show the product image, name, rating, current price, original price with percentage discount badge (if discounted), and an on-hover **Add to Cart** CTA.
3. **Product Inspection:** Clicking a product card opens the **Product Detail View**, where the visitor inspects a 3+ image gallery, brand, rating, active promotion badge, variant options, stock availability, and readable technical specifications before clicking **Add to Cart**.
4. **Checkout & Draft Invoice Creation:** The visitor opens the cart, reviews items and quantities, enters their **Buyer Name**, **Buyer Phone**, **Buyer Email**, and **Delivery/Meetup Note**, and confirms the order. The system creates an order at stage `OrderInitiation` and generates an **Order Invoice** with status `DRAFT` (showing the products-vs-price table and buyer contact details).
5. **Vendor Catalog & Promo Setup:** The retailer opens the vendor portal (`vendor.<hostname>`) directly (no login required in the PoC) and uses the sidebar (**Orders**, **Products**, **Promotions**, **Invoices**) to add products via a multi-step form (or bulk CSV import) and publish promotional banners tied to specific products.
6. **Vendor Order Fulfillment & Meetup Coordination:** When the vendor opens a newly placed order in **Orders**, its stage automatically transitions from `OrderInitiation` to `OrderReceived`. After contacting the buyer via the invoice phone/email details to arrange a meetup or delivery, the vendor advances the order to `OrderProcessed`, and upon delivery and payment, marks it `OrderDelivered` (which updates the linked Invoice status from `DRAFT` to `PAID` and decrements stock) or `OrderCancelled`.
7. **Buyer Order Tracking:** At any point, the buyer receives status updates via email notification and can enter their **phone number** in the storefront's **Track Order** view to see their lifetime order history, current stage across the 5-step progress bar, and invoice status.

## Screens and Layout

### 1. Storefront Surfaces (Main Hostname)
- **Header & Navigation Bar:** Brand title/logo, all-caps category quick-links, keyword search bar, **Track Order** button, and **Cart** button with live item count badge.
- **Homepage Hero & Promo Banner Section:** Displays active Flash Sale and Seasonal Deal banners configured in the vendor portal, clicking through to the promoted product(s).
- **Filter & Product Grid Section:** Filter controls for **Category**, **Brand**, and **Price Range** alongside the responsive grid of **Product Cards** (showing `productImage`, `productName`, `ratingValue`, `price`, `initialPrice` + `percentageDiff` badge when discounted, and an on-hover `Add to Cart` CTA; disabled with an `Out of Stock` badge when stock is `0`).
- **Product Detail View (Modal or Dedicated Page):** Multi-image gallery (minimum 3 images for active products), `productName`, `brand`, `ratingValue`, active promotion callout, variant selector with stock count, technical specifications and description table/block, and `Add to Cart` CTA button.
- **Cart & Checkout View/Drawer:** Line-item list with quantity controls, order total, buyer form (`Buyer Name`, `Buyer Phone`, `Buyer Email`, `Delivery Note`), and `Confirm Order` button that reveals the generated `DRAFT` **Order Invoice**.
- **Buyer Order Tracking View:** Phone number lookup input that renders all orders associated with that phone number, showing each order's 5-stage progress tracker (`OrderInitiation`, `OrderReceived`, `OrderProcessed`, `OrderDelivered`, `OrderCancelled`), email notification log/status, and expandable **Order Invoice** table.

### 2. Vendor Admin Portal (`vendor.<hostname>` subdomain, with `/vendor` fallback for local preview)
- **Persistent Left Sidebar Navigation:** Switches between four sections: **Orders**, **Products**, **Promotions**, and **Invoices**, plus a visible low/zero-stock alert banner when any product hits `0` stock.
- **Orders View:** Table of all orders showing Order ID, Buyer Name, Phone/Email, Delivery Note, Total, and current stage. Opening an `OrderInitiation` order marks it `OrderReceived` and shows action buttons to transition to `OrderProcessed`, `OrderDelivered`, or `OrderCancelled`.
- **Products View:** Inventory table showing product thumbnail, name, category, variants/stock count, price, and image-completion status. Includes two creation flows:
  - **Multi-Step Product Dialog (Create / Edit):**
    - *Step 1 — Basic Identity:* Product Name, Brand, Select Category.
    - *Step 2 — Pricing & Stock:* Variants, Price, Initial Price (optional for discounts), and Amount in Stock.
    - *Step 3 — Specifications & Description:* Technical specifications and long-form condition/product description.
    - *Step 4 — Media Gallery:* Upload/attach at least 3 product images.
  - **CSV Bulk Import Dialog:** Upload a CSV file of products without requiring 3 images in the CSV itself; imported rows appear in the vendor Products table flagged as `Needs Images (3 required)` until the vendor edits them to attach the 3+ images required for storefront publishing.
- **Promotions View:** Gallery of predefined banner design templates (Flash Sale / Seasonal Deal styles). The vendor selects a template, picks a target product from inventory, sets promotion headline/discount details, and publishes it to the storefront homepage.
- **Invoices View:** List and printable/inspectable detail view of all order invoices showing the **Products vs. Price Table**, Buyer Name, Buyer Phone, Buyer Email, Delivery Note, and **Invoice Status** (`DRAFT` until the order reaches `OrderDelivered`, then `PAID`, or `VOID/CANCELLED` if `OrderCancelled`).

## Look and Feel

Source: Learner visual direction ("Espresso Haute" palette and editorial typography) combined with `scope.md > Inspiration & Identity`.

- **Color Palette ("Espresso Haute"):**
  - **Primary Background Base:** Warm Alabaster (`#FDFBF7`) — soft, cream-toned gallery backdrop replacing stark white for product photography.
  - **Structure & Primary Text:** Dark Roasted Espresso Brown (`#1A1110`) — deep, organic tone replacing pure black for typography, borders, and key surfaces.
  - **Primary Accent:** Brushed Brass (`#D4AF37`) — metallic warmth used for primary CTAs, active states, ratings, and promotional highlights.
  - **Secondary Accent:** Muted Sage Green (`#9CAF88`) — used for trust badges, stock indicators, and order progress highlights.
- **Typography ("Editorial Runway meets Boutique Marketplace"):**
  - **Hero & Section Headings:** Bold, high-contrast serif (`Cormorant Garamond` or `Ogg`) for an authoritative editorial presence.
  - **Category Tags, Badges & Navigation:** Geometric sans-serif (`Futura` or geometric equivalent) set in `ALL-CAPS` with wide letter-spacing.
  - **Body Copy, Tables & Technical Specifications:** Legible neutral sans-serif (`Inter`) with a generous line-height of `1.6` for effortless reading of commercial appliance specs and invoice tables.

## Features and Behavior

### 1. Storefront Discovery, Search, and Filtering
Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`

- As a **buyer**, I want to browse promotional banners and filter products by keyword, category, brand, and price range so that I can quickly find commercial appliances within my budget.
  - [ ] Homepage displays active Flash Sale and Seasonal Deal banners at the top of the storefront; clicking a banner filters or opens the promoted product.
  - [ ] Product cards display `productImage`, `productName`, `ratingValue`, `price`, `initialPrice` + `percentageDiff` badge (only when `initialPrice > price`), and reveal the `Add to Cart` CTA on hover.
  - [ ] Selecting a category, brand, price range, or typing a search query immediately filters the displayed product grid to matching active products.

### 2. Product Detail Gallery and Specifications
Source: `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`

- As a **buyer**, I want to inspect a multi-image gallery, technical specifications, brand, and active promotion details on a product's detail view so that I can trust the condition and fit of refurbished equipment.
  - [ ] Clicking a product card opens the Product Detail View with an interactive gallery displaying all 3+ product images.
  - [ ] Detail view displays `productName`, `brand`, `ratingValue`, price (and discount percentage if applicable), variant selector, stock availability, promotion badge (if attached to an active promo), and full technical specifications/description.
  - [ ] Clicking `Add to Cart` adds the selected product/variant to the cart and increments the header cart counter.

### 3. Cart, Checkout, and Draft Invoice Generation
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`

- As a **buyer**, I want to confirm my cart with my contact and delivery details and immediately receive an itemized Order Invoice so that the vendor and I can coordinate meetup and payment.
  - [ ] Cart view allows adjusting item quantities or removing items and calculates the running subtotal.
  - [ ] Checkout form requires `Buyer Name`, `Buyer Phone`, `Buyer Email`, and `Delivery Note` before submission.
  - [ ] Submitting the order creates a new order in `OrderInitiation` status and displays an **Order Invoice** containing a **Products Bought vs. Price Table**, Buyer Name, Buyer Phone, Buyer Email, Delivery Note, and Invoice Status set to `DRAFT`.

### 4. Buyer Phone Lookup, Order Lifecycle Tracking, and Email Updates
Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`

- As a **buyer**, I want to look up my orders by phone number and receive email status updates so that I can track my order from initiation to delivery.
  - [ ] Entering a phone number in the **Track Order** view displays the lifetime list of orders placed with that phone number, including their current stage and invoice details.
  - [ ] Each order renders a progress indicator showing its current state among: `OrderInitiation`, `OrderReceived`, `OrderProcessed`, `OrderDelivered`, or `OrderCancelled`.
  - [ ] Whenever an order's stage changes, an email update is triggered (or logged/previewed in the PoC if no external SMTP key is configured) for the buyer's email address.

### 5. Vendor Product Management (Multi-Step Form & CSV Bulk Import)
Source: `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`

- As a **retailer**, I want to create or edit products using a multi-step form or bulk-upload products via CSV so that I can rapidly populate and maintain my catalog.
  - [ ] Opening the **Multi-Step Product Dialog** walks through: (1) Name, Brand & Category, (2) Variants, Price, Initial Price & Stock, (3) Specifications & Description, and (4) uploading/providing at least 3 images before publishing directly to the storefront.
  - [ ] Uploading a CSV in **Products** imports product rows without requiring 3 images in the CSV file; imported products with fewer than 3 images are saved as `Pending Images` in the vendor table and become visible on the storefront once the vendor edits the product and adds at least 3 images.
  - [ ] When a product's stock reaches `0`, an out-of-stock alert appears in the vendor portal, and the storefront product card is disabled with an `Out of Stock` label.

### 6. Vendor Promotions & Banner Builder
Source: `scope.md > The Unique Kernel`, `scope.md > The POC Boundary`

- As a **retailer**, I want to create Flash Sale and Seasonal Deal banners from predefined designs and link them to products so that deals stand out on the storefront.
  - [ ] In the **Promotions** tab, the vendor can choose from predefined banner design templates, select an existing product from inventory, enter the promotion title/type (`Flash Sale` or `Seasonal Deal`) and discount price, and save the promotion.
  - [ ] Saving a promotion immediately adds the styled banner to the storefront homepage and updates the linked product's discount pricing (`initialPrice` and `percentageDiff`) on its product card and detail view.

### 7. Vendor Orders and Invoice Management
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`

- As a **retailer**, I want to view incoming orders, step them through fulfillment stages, and manage invoices so that stock and payment records stay accurate.
  - [ ] When the vendor clicks to open an order in `OrderInitiation` status inside the **Orders** tab, its status automatically updates to `OrderReceived`.
  - [ ] The vendor can update an order's status to `OrderProcessed` (after meetup/delivery is agreed), `OrderDelivered` (when completed and paid), or `OrderCancelled`.
  - [ ] Marking an order as `OrderDelivered` automatically updates the corresponding invoice in **Invoices** from `DRAFT` to `PAID` and deducts the ordered quantities from product stock (triggering the out-of-stock state if stock reaches `0`).

## States and Boundaries

- **First Use (Pre-Seeded Catalog):** On first load, the app comes pre-populated with a realistic set of refurbished commercial espresso machines and appliances (each with 3+ images, specs, ratings, and at least one active Flash Sale banner) so the storefront and vendor portal are immediately demonstrable.
- **Out-of-Stock State (`stock === 0`):** The storefront renders the product card in a disabled state with an `Out of Stock` badge and disables the `Add to Cart` CTA; the vendor portal displays an out-of-stock alert badge in the sidebar/Products view.
- **CSV Import Incomplete-Image State:** Products imported via CSV without 3 images are saved in the vendor's **Products** table with a `Needs 3+ Images` badge and are withheld from the public storefront until 3 images are added via the product edit dialog.
- **Empty Search / Filter / Order Lookup State:** If a buyer's search/filter matches no products, a clear empty state with a `Reset Filters` button is shown. If a phone number lookup matches no orders, a friendly message explains no orders were found for that phone number.
- **Vendor Access Boundary:** The vendor portal is accessible via `vendor.<hostname>` (and `/vendor` route or switcher for convenient single-URL demoing) without authentication during the PoC.

## Product Decisions

- **Invoice-First Checkout Instead of Live Payment Rails:** Checkout generates a `DRAFT` invoice with a products-vs-price table and buyer contact info so the vendor and buyer can arrange physical inspection/meetup and payment on delivery—matching how high-value refurbished commercial equipment is actually bought while keeping payment gateway complexity out of the PoC.
- **5-Stage Order Lifecycle Linked to Vendor Actions:** Orders progress through `OrderInitiation` → `OrderReceived` (auto-triggered when vendor opens the order) → `OrderProcessed` → `OrderDelivered` (flips invoice from `DRAFT` to `PAID`) or `OrderCancelled`.
- **Phone Number Order Lookup + Email Updates:** Buyers track their lifetime orders simply by entering their phone number on the storefront (and receive email notifications on status changes), avoiding mandatory buyer account registration in the PoC.
- **Two-Stage CSV Image Rule:** CSV imports do not require 3 image URLs inside the spreadsheet; instead, the 3-image minimum is enforced after CSV upload before a product goes live on the storefront.
- **Open Vendor Portal for PoC Demo:** Vendor login/authentication is deferred so the 2–4 hour build and short demo video can move frictionlessly between `vendor.<hostname>` and the storefront.

## What We're Building

- Storefront with "Espresso Haute" visual identity, Flash Sale/Seasonal Deal promo banners, search + category/brand/price filtering, product cards with discount math and hover CTAs, and out-of-stock handling.
- Product Detail View with 3+ image gallery, brand, rating, promotion badges, variant/stock display, and technical specifications.
- Cart, Checkout form, and automatic `DRAFT` Order Invoice generation with Products-vs-Price table.
- Buyer Order Tracking by phone number (displaying lifetime orders and 5-stage progress) plus email status notifications.
- Vendor Portal (`vendor.<hostname>`) with 4 sidebar views (**Orders**, **Products**, **Promotions**, **Invoices**), multi-step product creation/editing, CSV bulk import, predefined promo banner creator, automatic `OrderReceived` transition on open, and `DRAFT` → `PAID` invoice completion.

## Deferred From the POC

- **Vendor Authentication & Role-Based Access Control:** Deferred until after the PoC demo so the build stays focused on the core marketplace and fulfillment workflow.
- **Buyer Accounts & Saved Profiles:** Replaced in the PoC by phone-number order lookup so buyers can purchase and track orders without registration friction.
- **Live Payment Gateways (MPESA / Card Checkout):** Replaced by the `DRAFT` → `PAID` Order Invoice flow coordinated upon equipment delivery/meetup.

## Possible Later Enhancements

- **Live MPESA & Card Checkout Integration:** Allow buyers to pay deposits or full invoice amounts directly online once an order reaches `OrderProcessed`.
- **WhatsApp & Live Chat Escalation:** One-click WhatsApp handoff from an Order Invoice or Product Detail page to negotiate delivery scheduling directly.
- **SEO Rich Snippets & AI Description Generator:** Structured schema markup for Google product discovery and AI-assisted technical specification drafting in the vendor multi-step form.

## Non-Goals

- **Full Multi-Vendor Marketplace Onboarding:** This PoC serves a single retailer ("Dawa Equips"), not competing third-party sellers.
- **Real-Time In-App Chat Routing:** Buyer-vendor communication uses the phone/email details captured on the Order Invoice.
- **Complex Customer Review Moderation & Wishlists:** Product cards and detail views display ratings, but full review submission/moderation workflows are out of scope for the PoC.

## Open Questions

- None blocking `4-spec`. (Technical implementation of `vendor.<hostname>` routing locally alongside email notification delivery/preview will be decided in `4-spec`.)
