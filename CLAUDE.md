# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)
npm run format       # Prettier (single quotes, 100-char lines)
npm run deploy       # Build + publish dist/ to gh-pages branch
```

There is no test runner configured — `lint` + `typecheck` are the only automated checks.

## Architecture

**Al Pie - Tienda Feliz** is a React 18 + Vite + TypeScript e-commerce store. No backend, no payment gateway — orders are submitted by redirecting the buyer to WhatsApp with a pre-built message.

### Request flow

Landing (`/`) → Catalog (`/catalogo`) → Product detail (`/producto/:slug`) → Cart (`/carrito`) → Checkout form (`/checkout`) → WhatsApp redirect → Thank-you (`/gracias`)

Routing uses a `HashRouter` in `src/App.tsx` because the site is served statically from GitHub Pages under the base path `/tienda/` (set in `vite.config.ts`). Deployment happens automatically via `.github/workflows/deploy.yml` on push to `main`; `npm run deploy` is the manual fallback. Note that `dist/` is **committed to the repo**, so a build dirties the working tree.

### State management

Cart state lives in `src/hooks/use-cart.ts` (Zustand, persisted to localStorage as `cart:v3` with a `migrate` that re-syncs stale unit prices to `product.basePrice`). A cart item is uniquely identified by `productId + selectedSize + selectedInterior + selectedCover + personalization` — adding an identical variant increments quantity rather than creating a new entry. `selectedModel` is *not* part of cart identity even though it is carried into the WhatsApp message.

### Pricing and promotions

All price math goes through `src/lib/pricing/calc-cart-pricing.ts`; never compute totals inline in components. Eligibility predicates live in `src/config/promotions.ts` (`isEligibleForDiscount`, `isEligibleFor2x1`, `isHotSaleActive`, `isEligibleForHotSale`).

Three promotions stack, applied in this order, each on the running line total:

1. **2x1** (`twoForOne`) — pools all eligible units across lines, makes the cheapest `floor(n/2)` free. Category-restricted.
2. **Percentage discount** (`discount`) — category-restricted, applied to the post-2x1 total so free units aren't double-discounted.
3. **Hot Sale** (`hotSale`) — applies to **all** categories, but only when today falls inside the `startDate`/`endDate` window *and* `enabled` is true.

`calculateCartPricing` returns a per-line `lines` breakdown keyed by the same identity tuple as the cart, plus nullable `promo` / `percent` / `hotSale` summary objects that the UI and the WhatsApp message render only when non-null.

### Business configuration

`src/data/data.ts` (`vars`, typed as `AppVars`) is the single source of truth for business variables: contact/WhatsApp number, social links, `personalizationSurcharge`, and all three promotion configs. **Enable, disable, and retune promos by editing `vars.promotions` in `data.ts`.**

The `.env` file (`VITE_PROMO_2X1`, `VITE_DESCUENTOS`, `VITE_PORCENTAJE_DESCUENTO`) is **dead configuration** — nothing in `src/` reads `import.meta.env`. Don't add env reads in components; if a value must be configurable, add it to `vars`.

Promo UI components live in `src/components/promos/` (`HotSaleBanner`, `HotSaleModal`, `Promo2x1`, `AnnouncementBar`, `BlackFridayModal`) and are mounted from `src/pages/Index.tsx` and `src/pages/Shop.tsx`. Modal frequency capping is handled by `src/hooks/usePromoModal..ts` (note the double dot in the filename) via localStorage/sessionStorage cooldowns.

### Product data

`src/data/products.ts` is the static "database": a `productoImagenes` map from asset-slug → ordered media list, the `products` array, and the `getProductBySlug` / `getProductsByCategory` lookups used by the routes. Media paths are **relative** (`assets/...`) so they resolve against the `/tienda/` base; the files live in `public/assets/`. The list mixes `.webp` images and `.mp4` videos — the gallery components (`ProductImageGallery`, `FullscreenModelDialog`) branch on the extension. Cover/model options are in `src/data/options.tsx`.

### WhatsApp checkout

`src/lib/whatsapp.ts` builds every WhatsApp message string and `wa.me/` link. Use the exported helpers (`buildCheckoutMessage`, `buildPdpMessage`, `buildShopMessage`, `buildWaLink`) — never construct message strings ad-hoc in components. `buildCheckoutMessage` calls `calculateCartPricing` itself, so promo lines in the message stay consistent with the cart UI automatically.

### Key conventions

- Currency formatting: `formatARS()` from `src/lib/currency.ts`.
- Tailwind class merging: `cn()` from `@/lib/utils`.
- UI primitives: check `src/components/ui/` (shadcn/ui) before creating new components.
- Canonical `CartItem` is in `src/types/cart.ts`. A stale duplicate `CartItem` also sits in `src/types/product.ts` — ignore it and import from `@/types/cart`.
- New pages: add file to `src/pages/`, register `<Route>` in `src/App.tsx` **above** the catch-all `path="*"` route.
- New product attributes that affect cart identity: update `src/types/cart.ts` and `src/types/product.ts`, then update both the dedup logic in `use-cart.ts` (`addItem`, `removeItem`, `updateQuantity`) **and** `lineKey()` in `calc-cart-pricing.ts` — they must stay in sync.
- Forms use `react-hook-form` + `zod` via `@hookform/resolvers`.
- Future backend migration: `QueryClientProvider` is already wired in `App.tsx` — use `@tanstack/react-query` hooks when replacing the static data in `src/data/products.ts`.

`AGENTS.md` holds a longer architecture reference in Spanish. `README-dev.md` is partly outdated (it says `cart:v1`; the store is `cart:v3`), and `README.md` is the stock Lovable scaffold README.
