# Dawa Equips Marketplace

Development notes for the refurbished commercial appliance marketplace. Buyers can browse products, place an order, receive a draft invoice, and track order progress. Vendors manage products, promotions, orders, invoices, and stock in the vendor portal.

## Requirements

- Node.js 20 or newer and npm
- A PostgreSQL database; the project is configured for Neon

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`. `RESEND_API_KEY` is optional; without it, order emails are recorded for in-app preview.
3. Apply the database schema and seed the demo catalog:

   ```sh
   npm run db:push
   npm run db:seed
   ```

4. Start the API and Vite development server with `npm run dev`.
5. Open `http://localhost:5173` for the storefront or `http://localhost:5173/vendor` for the vendor portal.

The API defaults to port 4000. Set `PORT` to change it; set `VITE_API_URL` if the frontend needs to use a different API address.

## Build

Run `npm run build` to type-check and build the client and bundle the server. Run `npm run start:server` to start the built API server.

## Proof-of-concept limits

The vendor portal has no login, and checkout does not process payments. The order invoice starts as `DRAFT`; vendor fulfillment updates it to `PAID` when marked delivered. Product images may be stored as Base64 data in PostgreSQL. See `devpost/spec.md` for the architecture and environment details.
