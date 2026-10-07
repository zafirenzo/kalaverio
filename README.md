# Kalaverio

Next.js 16 (App Router) · Supabase · Razorpay Standard Checkout · Resend · Vercel Analytics. Sanity optional.

## Run

```bash
npm install
cp .env.example .env.local   # fill in test keys
npm run dev
npm test                     # launch-state, validation and signature checks
```

Without keys the site still runs: counts read zero, the waitlist keeps entries in memory (dev only), and Pay explains that payments are not connected.

Preview other launch states with `LAUNCH_STATE=open` (or `before`, `closed`) in `.env.local`. In production leave it unset; `LAUNCH.opensAt` / `closesAt` in `lib/site.ts` switch the site on launch night.

## Set up

1. **Supabase** (new project, not Zenith's): run `supabase/migrations/001_init.sql` in the SQL editor. RLS is on; the public Register reads only the `register_public` view.
2. **Razorpay** (test mode first): add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Create a webhook to `https://<domain>/api/razorpay/webhook` with events `payment.captured` and `refund.processed`, and set its secret as `RAZORPAY_WEBHOOK_SECRET`.
3. **Resend**: verify the domain, set `RESEND_API_KEY` and `EMAIL_FROM`.
4. **Sanity** (optional): create a `zset` document type with fields matching `ZSet` in `lib/sets.ts` (slug, name, for, price, runSize, soldOut, line, details, motif, order, worn/flat/closeup images with alt). Set `SANITY_PROJECT_ID`.
5. **Vercel**: add every variable above as environment variables. Live keys never go in code.

## How payment works

1. Checkout validates the form on the server (PIN checked against India Post), re-checks sets left, inserts an order (`created`) and creates the Razorpay order server-side.
2. The browser callback signature is verified, then the buyer lands on `/thanks`, which waits.
3. Only the webhook (`payment.captured`, HMAC-verified) marks the order paid, through `mark_order_paid()`: it locks, refuses to oversell (marks `refund_due` instead), and assigns the lowest free Register Nº and set Nº. The receipt email goes out once.
4. `refund.processed` marks the order refunded; the row leaves the Register and its Nº is freed.

## Before launch: replace placeholders

Search for `PLACEHOLDER` in `lib/site.ts` and `lib/sets.ts`: set names (all but The Honour), prices, garment lines, size measurements, exchange rule, delivery window, seller legal name, address, email, GSTIN, Instagram. Add photographs (AVIF/WebP, 200 KB or less, alt text) to each set's `photos`.

## Launch checklist

- [ ] Test payment and test refund end to end (needs keys)
- [x] Order is marked paid only by the webhook, never the browser callback
- [x] Sets left falls only on paid orders and never below zero; sold-out swaps to the Volume II waitlist
- [x] Under-18 path asks for a guardian; Register row hidden unless the guardian ticks the box
- [x] Policies page: refund rule, exchange rule, delivery, GST line (wording pending a CA)
- [ ] Live keys in Vercel env vars
- [x] RLS on; public Register reads a view
- [x] Waitlist rejects duplicates (unique, normalised) and rapid repeats (honeypot + throttle)
- [ ] Every photograph has a description and is under 200 KB (photos not supplied yet)
- [x] States switch from "Before 14 October" to "Open" by date
# kalaverio
