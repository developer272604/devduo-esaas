# Devduo ESaas storefront demo

A frontend-only, themeable demo storefront for Devduo ESaas. In a sales call, open **Settings**, pick a template, a colour and a font, and the whole store (home, category, product, cart, checkout, orders) changes instantly.

Built with **Vite, React 18, TypeScript (strict), React Router and Zustand**. No backend: data is local config plus `localStorage`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check, then production build into dist/
npm run preview    # serve dist/ on http://localhost:3100
npm run test       # Vitest: pricing, theme, validation, stores, adapters
npm run e2e        # Playwright: templates, template switch, full purchase flow, reload
npm run lint       # tsc + "no hard-coded colours outside tokens.css"
```

Demo values: OTP `123456`, coupons `WELCOME10` and `FREESHIP`.

## Three layers

1. **Theme** (colour, font, mode, corners) only changes CSS variables set by `applyTheme()` in `src/lib/theme.ts`. Components never hard-code a colour; all literals live in `src/styles/tokens.css`.
2. **Template** is one config per folder in `src/templates/<id>/` (`config.ts`, `products.ts`, `images/`). It controls the home page sections, the catalogue, brand and default look.
3. **Common pages** (shop, category, product, search, wishlist, cart, checkout, success, orders) are one shared implementation. They never fork per template.

Adding a template: create the folder, add one line to `src/templates/index.ts`. A new home section type is the only change that touches components (`src/components/sections/`).

## Templates (home pages taken from the supplied designs)

| Id | Brand | Design |
|---|---|---|
| `herbal` | Ooty Herbals | Photo hero, honey range band, 6-up bestsellers, dual promos |
| `gadgets` | MobiStore | Phone showcase hero, category tiles, triple promos |
| `fashion` | Aarohi | Editorial hero, circle categories, sale banner with benefits |
| `marketplace` | Marketly | Deals hero, flash deal countdown, brand promos, testimonial |
| `wellness` | Gutwell | Photo panels, dark spotlight card, product feature rows |

## Demo tools (for sales calls)

- **First-visit tour.** A four-step walkthrough opens the first time someone arrives. Skip ends it for good; Settings has "Show the tour again".
- **Edit (home page only).** On the home page, the bottom bar's Edit button turns on edit mode. Click any text to type over it (Enter saves, Escape cancels, clearing the text restores the original). Click an image, or its camera button, to replace it from the device. A small x on a replaced image puts the original back.
  Other pages have no Edit button and nothing is editable, but they show the saved changes (brand name, footer, product names and pictures). Leaving the home page switches edit mode off.
  Edits are saved per template in the browser (`devduo.custom`), so they survive a refresh and any theme change. Settings > Your edits resets them. Product names and descriptions can be edited; prices cannot.
- **Full screen.** Hides the tools so the site fills the screen. Esc exits.
- **Screenshot.** Captures the whole site (not just the visible part) without the tools or edit marks, adds a diagonal watermark and a corner badge, then shows it in a dialog with **Download** and **Share on WhatsApp**. On phones the share sheet attaches the image. On computers a link cannot attach an image, so the image downloads and WhatsApp opens with the message ready to attach it to.

## Structure

```
index.html            inline script restores the last theme before first paint
src/main.tsx          entry: fonts, styles, router
src/App.tsx           routes
src/pages/            thin route wrappers
src/components/       layout, common, settings, auth, sections, product, checkout, views
src/templates/        registry plus one folder per template
src/store/            Zustand stores (persist to localStorage, prefix devduo.)
src/lib/              theme, pricing, validation, format, adapters
src/styles/           tokens, base, layout, common, sections, pages, settings
```

## Adapters

`src/lib/adapters/` defines `CatalogAdapter`, `AuthAdapter`, `PaymentAdapter`, `OrderAdapter` and `NotifyAdapter` with mock implementations. UI code calls these only. Replace the object exported from `src/lib/adapters/index.ts` to plug in Devduo ESaas payments and the WhatsApp Business API.
