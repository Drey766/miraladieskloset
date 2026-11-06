# Mira Ladies Kloset — mobile-first sneaker storefront

Next.js 14 (App Router) · Tailwind CSS · TypeScript · **no database** — products, blogs, FAQs and
testimonials are plain JSON files. Orders go out through **M-Pesa (STK Push)** and **WhatsApp**.

This build reuses the data layer and backend (cart, wishlist, checkout, M-Pesa, WhatsApp) from an
earlier sneaker-shop build for a different client, with the whole front end redesigned — palette,
type, shapes and copy — for Mira's own trendy, quality-focused, ladies-first identity.

---

## ⚠️ To rebrand this site for a different shop, edit only `src/config/brand.ts`.

**Do not hardcode brand strings elsewhere — if you find one, it's a bug.**

`src/config/brand.ts` is the single source of truth for the shop name, tagline, phone / WhatsApp,
location, delivery fees, colours, fonts, section labels, checkout wording and every piece of
micro-copy (empty states, badges, button labels…). Tailwind colours, CSS variables, page metadata,
WhatsApp links, the order-ID prefix and localStorage keys all flow from it.

Three things live outside that file because the tooling forces it:

| What | Where | What to do when rebranding |
|---|---|---|
| Font loading | `src/app/layout.tsx` | `next/font/google` needs literal font names at build time. Change the two calls (`Marcellus`, `Jost`) to match `brand.fonts`. |
| Logo + favicon | `public/logo.jpg`, `src/app/icon.jpg`, `src/app/apple-icon.jpg` | Replace the files, keep the names. |
| Catalogue & content | `src/data/*.json` | Replace with the new shop's products / posts / FAQs / testimonials. |

The blog posts, FAQs and testimonials are content, not config — they mention the shop in passing,
so re-read them when you rebrand.

---

## The design, at a glance

**The idea: a jewellery counter for sneakers.** The logo is brushed chrome and the shop's voice is "shine in style", so each shoe is shown like a piece in a display case. The look is carried by type, space and one signature detail rather than by decoration:

- **Hallmark stamp (`src/components/ui/Hallmark.tsx`).** A jeweller-style stamp built from the real shop unit (Shop E8), with the location around the ring (`brand.hallmark`). It's used in only two places, the hero and the visit section, so it stays special.
- **Colour.** White and pearl surfaces, a silver vignette taken from the logo behind the hero shoe, deep aubergine in place of black (buttons, footer, text), and garnet as a sparing accent: sale tags, the saved heart, count badges, errors.
- **Type: Marcellus + Jost.** Marcellus is for page and section headings only. It has one weight, so never bold it (`font-synthesis: none` stops browsers faking it). Its numerals read badly (its 1 looks like an I), so **anything with numbers uses Jost**: every price, product names, article subheadings. For display text that might contain a number, wrap it in `<DisplayText>`.
- **Symmetry.** The header's outer columns are equal so the wordmark is exactly centred. The hero is centred, all containers share one width, grids are always even, and testimonials always show three.
- **Photos.** `.photo-tile` makes photos fill their tile edge to edge, then brightens and multiplies them so white and grey source backdrops land on the same shade. New photos should be shot on a plain light background to benefit from this.
- **Shape.** Buttons are full pills, inputs and photos have a small radius, and product cards have no box at all. A photo shows at most one tag.
- **Copy.** Sentence case and no emoji in the interface. Personality comes from the words themselves ("we don't leave you on read").
- **Motion.** One moment only: the hero shoe settles in on page load. Everything else responds to a tap or hover, and `prefers-reduced-motion` is respected.
- **Hero shoe.** Set `brand.heroProductId` to feature a different pair.

## A naming note

The site's name is **Mira Ladies Kloset** (`brand.name` in `src/config/brand.ts`; everything else
follows automatically). The uploaded logo reads "Mira Kloset", and the Instagram account is still
`@mira_ladies_sneakers`, so the handle and link in `brand.ts` keep that spelling until the account
is renamed. `brand.storagePrefix` also keeps the old name on purpose: changing it would empty the
carts and saved pairs of anyone who has already visited.

The Instagram bio lists **0713 268 179** as the shop's line; a separate post used **0700 107 179**
for DM orders instead. This build uses the bio number everywhere (`brand.phone` / `brand.phoneIntl`
in `brand.ts`) — swap it there in one place if the other number is actually the primary one.

---

## Quick start

```bash
npm install
# .env.local is already in the zip with placeholders — fill in the values (see below)
npm run dev          # http://localhost:3000
```

**Test on a phone-sized screen first** (Chrome DevTools → device toolbar → 375px), then check
desktop. Things to tap through: sticky Add to Cart bar, size chips, filter bottom sheet, cart
drawer, checkout (pickup ⇄ delivery).

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

> **Why `eslint-config-next` is v15 in a Next 14 project:** ESLint 9 (flat config) crashes with the
> v14 config package. The v15 config lints Next 14 code fine. `next build` skips its built-in lint
> step for the same reason — run `npm run lint` yourself.

---

## Environment variables (`.env.local`)

9 variables, no database. Shop name / phone / WhatsApp link are **not** env vars — they're in `brand.ts`.

| Variable | What it is |
|---|---|
| `WHATSAPP_API_TOKEN` | WhatsApp Business Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone-number ID from Meta's API Setup page |
| `OWNER_WHATSAPP_NUMBER` | Who gets the order alerts, e.g. `254713268179` (falls back to `brand.phoneIntl`) |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Daraja app credentials |
| `MPESA_BUSINESS_SHORT_CODE` | `174379` = Daraja **sandbox**. Any other shortcode = **production** (this is how the app picks the environment) — see the Till note below |
| `MPESA_PASSKEY` | Lipa Na M-Pesa Online passkey |
| `MPESA_CALLBACK_URL` | `https://YOUR-DOMAIN/api/mpesa/callback` — must be public HTTPS |
| `NEXT_PUBLIC_SITE_URL` | Your live URL, e.g. `https://miraladiessneakers.co.ke` (used for metadata / SEO). Optional on Vercel: if it's empty or missing, the app falls back to your Vercel URL, so it can never break the build. |

Values that still start with `your_` are treated as "not configured".

**Running locally without keys:** choosing M-Pesa at checkout returns a friendly "dev mode" success and
prints the order in your terminal, so you can test the whole flow. In production, missing keys mean M-Pesa
is unavailable and orders fail loudly instead of silently disappearing.

## How orders work

1. Shopper fills in checkout → `POST /api/orders`.
2. The server **re-prices everything from `products.json`** (the browser's prices are ignored), works out the
   delivery fee from `brand.shipping`, and validates size / quantity / phone.
3. M-Pesa: sends an STK Push to the shopper's phone. Pay on pickup/delivery: skips this.
4. Sends the order to the owner on WhatsApp (format in `src/app/api/orders/route.ts`).
5. The order is also printed to the server log (Vercel → Logs) as a safety net.
6. When Safaricom calls `/api/mpesa/callback`, the owner gets a "payment received / failed" WhatsApp.
   The callback URL is public — **always confirm the money in your M-Pesa portal before handing over a pair.**
7. The confirmation screen always offers a "Send order on WhatsApp" button, so the shop hears about the order
   even if the automatic alert fails.

Nothing is stored in a database. If you later want an order history, this route is where to add it.

### M-Pesa setup — this shop uses a Till (Buy Goods), not a Paybill

The Instagram bio lists **TILL NO: 5562041**. `brand.payments.mpesaTransactionType` is already set to
`"CustomerBuyGoodsOnline"` for this. What you still need from Safaricom:

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) → get the consumer key and secret.
2. Ask Safaricom (or check the Daraja portal) whether Till 5562041 is enabled for **Till Number — Lipa Na
   M-Pesa Online**. If so, that Till number is your `MPESA_BUSINESS_SHORT_CODE` in production.
3. Sandbox testing: use shortcode `174379` and the passkey from the "Lipa Na M-Pesa Online" simulator page —
   this is a stand-in for the real Till until you're ready to go live.
4. Set `MPESA_CALLBACK_URL` to your deployed URL (localhost won't work — use a tunnel like ngrok while testing).
5. If Safaricom ever issues a separate Daraja shortcode that isn't the Till itself, set `PartyB` in
   `src/lib/mpesa.ts` to `5562041` so the STK push still charges the actual Till.

### WhatsApp setup
1. [developers.facebook.com](https://developers.facebook.com) → create an app → add **WhatsApp** → API Setup.
2. Copy the temporary/permanent token and the **Phone number ID** into `.env.local`.
3. **Important limitation:** Meta only allows free-text messages to a number that messaged your business number
   in the last 24 hours. For fully automatic alerts, create and get approved a message template in WhatsApp
   Manager and switch `src/lib/whatsapp.ts` to send a `template` message. Until then, have the owner send a
   message to the business number each day — or rely on the confirmation-screen WhatsApp button + server logs.

---

## Updating the shop

- **Products:** edit `src/data/products.json` (one object per shoe — see `Product` in `src/types/index.ts`).
  The current 36 products are reused from the earlier build's Decathlon-sourced catalogue (28 women's, 8
  unisex — no men's or kids' items), which happens to line up well with a ladies-only shop. Swap in Mira's
  actual stock and photos when they're ready. Optional per-product flags: `"in_stock": false` shows "Sold
  out", `"low_stock": true` shows "Almost out". Categories with no products are hidden automatically.
- **Re-import from a Decathlon-style export:** `python3 scripts/transform-products.py path/to/export.json`
  rewrites `products.json` (rules for names, prices, categories, gender, featured/new/clearance are at the
  top of the script; hand-fix any name in `NAME_OVERRIDES`).
- **Blog:** add an object to `src/data/blogs.json` (`slug`, `title`, `excerpt`, `tag`, `published_at`, `read_time`,
  `cover_product_id`, and `content` as HTML). The author line always shows `brand.shortName`. The 6 posts
  here are reused (and re-voiced) from the earlier build's general sneaker-care/sizing/authenticity topics.
- **FAQs / testimonials:** `src/data/faqs.json`, `src/data/testimonials.json`.
  **Replace the sample testimonials with real customer reviews before launch.**
- **Delivery fees:** `brand.shipping` (the numbers in the zip are placeholders — confirm them with the shop).
- **Sizes:** `brand.sizeRange` and `SIZES` in the transform script.

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel (framework: Next.js — nothing to configure).
3. Add the 9 environment variables. Set `NEXT_PUBLIC_SITE_URL` and `MPESA_CALLBACK_URL` to the live domain.
4. Deploy, then place a small real test order.

## Mobile-first by design

Most of this shop's customers buy from their phones (Instagram → WhatsApp → site), so every page is
written for a phone first: Tailwind classes are the mobile layout, and `sm:` / `md:` / `lg:` layer up from there.

- 2-column product grid on phones, up to 4 on desktop
- Big tappable size chips (44 × 44 px minimum) instead of a dropdown
- Sticky bottom Add to Cart bar on product pages, sticky Checkout / Place Order bars on cart and checkout
- Filters open as a bottom sheet on phones, a sidebar on desktop
- Hamburger menu, slide-in cart drawer, floating WhatsApp button (hidden on product, cart and checkout pages, and on the home page until you scroll)
- Swipeable product photos (CSS scroll-snap), horizontally scrolling category and related-product rails
- Large stacked checkout fields, 16 px+ inputs (so iPhones don't zoom in), M-Pesa number field with the phone keypad
- Verified with no sideways scroll at 320, 360, 375, 390 and 414 px wide, and every button/link at least 44 px tall

## Testing mobile responsiveness

- Chrome DevTools → device toolbar → **375 × 812** (also try 360 and 414), then 768 and 1280.
- Check there's no sideways scroll on any page, every button is comfortably tappable (44 px minimum),
  the sticky bar on product / cart / checkout doesn't cover the content, and the filter sheet slides up on `/shop`.
- Test on a real phone over your Wi-Fi: `npm run dev -- -H 0.0.0.0`, then open `http://<your-computer-ip>:3000`.

## Project layout

```
src/
├── config/brand.ts        ← ⭐ single source of truth
├── app/                   pages + the two API routes (orders, mpesa/callback)
├── components/            layout / home / shop / cart / contact / blog / ui
├── context/               CartContext, WishlistContext (localStorage)
├── data/                  products / blogs / testimonials / faqs (JSON)
├── lib/                   utils, filters, categories, mpesa + whatsapp helpers
└── types/index.ts
scripts/transform-products.py
```

## Notes

- Product photos are hot-linked from `contents.mediadecathlon.com` (whitelisted in `next.config.js`).
  Make sure you're allowed to use those images and products commercially — or upload Mira's own photos
  and update the JSON.
- The uploaded logo is a small (150×150) Instagram profile-photo export with its own grey background, not a
  transparent/high-res logo file. It works fine at the small sizes used here (nav, footer, favicon), but a
  larger, background-free version would look crisper if one exists.
- `contact` form and footer "drop list" open WhatsApp with the message ready to send (there's no email backend).
