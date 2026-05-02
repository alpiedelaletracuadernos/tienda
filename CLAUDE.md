# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)
npm run format       # Prettier (single quotes, 100-char lines)
npm run deploy       # Build + publish to gh-pages
```

## Architecture

**Al Pie - Tienda Feliz** is a React 18 + Vite + TypeScript e-commerce store. No backend — orders are submitted via WhatsApp.

### Request flow

Landing (`/`) → Catalog (`/catalogo`) → Product detail (`/producto/:slug`) → Cart (`/carrito`) → Checkout form (`/checkout`) → WhatsApp redirect → Thank-you (`/gracias`)

Routing is handled by a `HashRouter` in `src/App.tsx`. The Vite base path is `/tienda/`.

### State management

Cart state lives in `src/hooks/use-cart.ts` (Zustand, persisted to localStorage as `cart:v3`). A cart item is uniquely identified by the combination of `productId + size + interior + cover + personalization` — adding an identical variant increments quantity rather than creating a new entry. All price calculations go through `src/lib/pricing/calc-cart-pricing.ts`; never compute prices inline in components.

### Business configuration

`src/data/data.ts` (`AppVars.vars`) is the single source of truth for business variables: promo toggles, discount percentages, personalization prices. **Do not read `.env` variables directly in components** — `data.ts` reads them once and exposes them via `vars`.

Active feature flags (`.env`):
- `VITE_PROMO_2X1` — enable 2-for-1 promotion
- `VITE_DESCUENTOS` — enable percentage discounts
- `VITE_PORCENTAJE_DESCUENTO` — discount rate (currently 40%)

### WhatsApp checkout

`src/lib/whatsapp.ts` builds all WhatsApp message strings and `wa.me/` links. Use the exported helpers (`buildCheckoutMessage`, `buildPdpMessage`, `buildWaLink`) — never construct message strings ad-hoc in components.

### Key conventions

- Currency formatting: `formatARS()` from `src/lib/currency.ts`.
- Tailwind class merging: `cn()` from `@/lib/utils`.
- UI primitives: check `src/components/ui/` (shadcn/ui) before creating new components.
- New pages: add file to `src/pages/`, register `<Route>` in `src/App.tsx` **above** the catch-all `path="*"` route.
- New product attributes that affect cart identity: update interfaces in `src/types/cart.ts` and `src/types/product.ts`, then update the deduplication logic in `use-cart.ts` (`addItem`, `removeItem`, `updateQuantity`).
- Future backend migration: `QueryClientProvider` is already wired in `App.tsx` — use `@tanstack/react-query` hooks when replacing static data in `src/data/products.ts`.

See `AGENTS.md` for the full developer architecture reference (in Spanish).
