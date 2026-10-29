# Moving the Devduo ESaas demo to production

This storefront is a **demo**. Everything runs in the browser: the catalogue is static, the cart, orders and sign-in live in `localStorage`, the OTP is always `123456`, and payment is a timer. That is right for a sales call and wrong for real money. This page lists what has to be built on a server before real customers use it, and where in the code each piece plugs in.

Do not describe the demo as a secure payment system anywhere in the UI or in marketing copy.

## The seam

All data access goes through five adapters in `src/lib/adapters/` (`CatalogAdapter`, `AuthAdapter`, `PaymentAdapter`, `OrderAdapter`, `NotifyAdapter`). UI code calls these only. Replace the object exported from `src/lib/adapters/index.ts` with real implementations; no component should need to change.

`VITE_DEMO_MODE=false` builds the app for production: the mock auth, payment and order adapters refuse to run (every call throws a clear error) and the page shows "This build needs real services" until real adapters are wired in. The default build is demo mode.

## What needs a server

| Area | Today (demo) | Needed for production |
|---|---|---|
| **Sign-in** (`AuthAdapter`) | Fixed OTP `123456`, shown on screen. The "signed in" state is a value in `localStorage`, so anyone can sign in as anyone. | Send a real OTP over SMS or WhatsApp. Verify it **on the server** with expiry (about 5 minutes), attempt limits and rate limiting per phone and per IP. Issue a session as an `HttpOnly`, `Secure`, `SameSite` cookie. Never trust a user object sent from the browser. |
| **Prices and totals** (`src/lib/pricing.ts`) | Computed in the browser from the static catalogue. A tampered browser can change what it displays. | The browser sends only product ids, option and quantity. The **server** recomputes the subtotal, shipping, COD fee, coupon and total from its own catalogue, and returns the amount to charge. The browser's total is a preview. |
| **Coupons** | Two fixed codes validated in the browser. `WELCOME10` is unlimited-use and not limited to a first order. `FREESHIP` has no minimum order (intentional for the demo). | Validate on the server: usage limits per customer, first-order rule, expiry, minimum basket, and whether it combines with others (it does not today). |
| **Payment** (`PaymentAdapter`) | A 1.2 second timer, then success. Card, UPI and COD details are collected in your own inputs (card numbers are not stored). | Use the gateway's hosted fields or checkout page (Razorpay, Stripe or similar) so card data never touches your page. Create the payment on the server for the server-computed amount, use **idempotency keys**, and confirm orders from the gateway's **webhook**, not from the browser redirect. |
| **Orders** (`OrderAdapter`, `src/store/orders.ts`) | Stored in `localStorage`. Status can be edited by hand and "Demo: move to next stage" advances it. | Orders live in a database. Only staff tools and carrier or payment webhooks change status. Remove the demo advance button. Customers read their own orders only, through the session. |
| **Cancellation** | Allowed before "Shipped", enforced in the browser. | Enforce the rule on the server, trigger the refund, and restock. |
| **Catalogue and stock** (`CatalogAdapter`) | Static files per template. No stock levels. | Products, prices, images and inventory from the admin. Reserve stock at checkout. Do not show stock counts or reviews that are not real. |
| **Delivery check** (pincode box) | Any 6-digit pincode is "deliverable" in 4 days. | Real serviceability and delivery-date lookup from your courier. |
| **Notifications** (`NotifyAdapter`) | A text preview of a WhatsApp message. Nothing is sent. | WhatsApp Business API from the server, using approved templates and recorded customer opt-in. |
| **Tax and invoices** | Prices are shown as "inclusive of all taxes". | GST-correct invoices, HSN codes and state-wise tax where it applies. |

## Hosting and browser protections

- `public/_headers` sets a strict Content-Security-Policy (own origin only, no inline script, no framing, no plugins), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and a one-year `immutable` cache for hashed files. **That file is read by Cloudflare Pages and Netlify.** On another host, set the same headers in that host's configuration.
- The policy has `frame-ancestors 'none'`. If the demo must be embedded in another site, replace it with that site's origin.
- When the app starts loading images, fonts, analytics or an API from other origins, add each origin to the matching CSP directive (`img-src`, `connect-src`, ...) and keep the list as short as possible.
- The inline theme script was moved to `public/theme-init.js` so `script-src` does not need `'unsafe-inline'`.
- Dependencies: run `npm audit --omit=dev` in CI and fail on high or critical findings.

## Things the demo does on purpose

- Edit mode (text and image changes) is for the demo and is saved only in the visitor's browser. A real store would use an admin panel instead, and the edit tools and screenshot watermark would be removed or restricted.
- Replacement images are limited by browser storage (about 2.5 MB in total). A real product stores images on a CDN.
- Stored data is sanitised on load (`src/lib/sanitize.ts`) so a corrupted or tampered browser cannot crash the app or show a wrong total. This is a robustness measure, **not** a security boundary: everything in `localStorage` is user-editable.

## Checklist before launch

1. Real adapters for auth, payment, orders and notifications; `VITE_DEMO_MODE=false` builds and runs.
2. Server-side price, coupon and stock checks; the browser total is never trusted.
3. Payment through the gateway's hosted fields; orders confirmed by webhook; idempotency keys.
4. Sessions in `HttpOnly` cookies; OTP with expiry and rate limits.
5. Security headers applied on the production host; CSP reviewed for every outside origin.
6. Real catalogue, images, stock and delivery data.
7. Demo-only UI removed: Edit, Screenshot watermark tool, "Demo: move to next stage", demo OTP hint, "Demo store" wording.
8. Privacy policy, terms, refund policy and GST details in place.
