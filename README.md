# Dukaan — SaaS store builder

Path-based multi-tenant storefronts with WhatsApp checkout, built on
Next.js + Supabase, hosted free on Vercel.

## What's wired up in this starter

- Supabase Auth signup/login with live slug validation
- Postgres trigger that auto-creates a `stores` row on signup
- Full RLS: tenants only ever see their own data; the storefront only
  ever shows `active` stores to the public
- `/[storename]` — real storefront reading live products from Supabase,
  with cart + WhatsApp checkout (message template placeholders included)
- `/dashboard` — protected by middleware, shows the real store row
- Phase 1 manual payment instructions page after signup

## What's still a stub (build these next)

- `/dashboard/products` — products CRUD (design already validated in the
  HTML demo; port that UI here)
- `/dashboard/settings` — store settings form (name, WhatsApp number,
  banners, Meta Pixel, message template)
- `/dashboard/orders` — orders list
- Admin panel (activation queue, all-stores list) — not part of the
  tenant-facing app; build as a separate protected route or app
- Theme system — currently one hardcoded look; convert to the
  JSON-config approach once the single theme is solid
- Coupons, order lookup by phone (agreed priorities from planning)

## Setup

1. **Create a Supabase project** at supabase.com (free tier).
2. **Run the schema** — open the SQL Editor in your Supabase dashboard,
   paste the contents of `supabase/schema.sql`, and run it.
3. **Copy environment variables** — duplicate `.env.local.example` as
   `.env.local` and fill in your Supabase URL + anon key from
   Project Settings → API.
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Run locally:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.
6. **Deploy:** push this repo to GitHub, then import it in Vercel.
   Add the same two environment variables in Vercel's project settings.

## Testing the flow end-to-end

1. Go to `/signup`, create an account with a store name.
2. You'll land on `/signup/payment-instructions` — the store row now
   exists in Supabase with `status = 'pending_payment'`.
3. In the Supabase Table Editor, manually flip that store's `status` to
   `'active'` and set an `expires_at` a year out (this is what the admin
   panel will do automatically later).
4. Visit `yoursaas.com/your-store-slug` — the real storefront should
   load. Add a test product directly in the Supabase Table Editor to
   see it appear.
5. Add it to cart and tap checkout — it should build a real `wa.me` link
   with the message template filled in.
