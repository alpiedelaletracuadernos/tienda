Al Pie - Tienda Feliz (React + Vite + TS + Tailwind + Zustand)

Resumen de arquitectura
- Entradas: `src/main.tsx`, rutas en `src/App.tsx` (React Router).
- Estado global: `src/hooks/use-cart.ts` (Zustand + persist v1).
- Componentes: `src/components/*` (layout, home, products, ui).
- Páginas: `src/pages/*` (Index, Shop, ProductDetail, Cart, Checkout, ThankYou, NotFound).
- Datos: `src/data/*` (products, opciones, variables de app).
- Tipos: `src/types/*` (product, cart).
- Helpers: `src/lib/*` (utils, whatsapp, currency).
- Assets: `src/assets/*` y `public/assets/*` (favicon).

Convenciones
- Componentes: PascalCase. Funciones/vars: camelCase. Assets: kebab-case.
- Tipado estricto sin `any`. Tipos compartidos en `@/types/*`.
- Mensajes de WhatsApp centralizados en `@/lib/whatsapp.ts`.
- Moneda ARS con `formatARS` de `@/lib/currency.ts`.

Zustand (carrito)
- Store en `src/hooks/use-cart.ts` con persistencia `name: 'cart:v1'`.
- Acciones semánticas: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
- Selectores exportados en `cartSelectors` para reducir re-render donde aplique.

WhatsApp helpers
- `buildWaLink(phone, message)` devuelve URL lista para abrir.
- `buildPdpMessage(product, selections, personalization)` para PDP.
- `buildShopMessage(filters, personalization)` para listado/consulta.
- `buildCheckoutMessage(cartItems, buyerInfo)` para checkout.

Comandos
- `npm run dev` levanta Vite.
- `npm run build` compila producción.
- `npm run lint` pasa ESLint.
- `npm run typecheck` corre TypeScript sin emitir.
- `npm run format` (requiere instalar Prettier) formatea archivos.

Decisiones de UI/UX
- Layout raíz previene scroll lateral con `overflow-x-clip`.
- Galería de producto con thumbnails scrolleables y video `preload="metadata"`.
- Botón de fullscreen opcional en la galería (`onOpenFullscreen`).

Favicon
- Archivo esperado: `public/assets/locoConClip.png`.
- En `index.html` se referencian `rel="icon"` y `apple-touch-icon`.

Cómo agregar un modelo/colección
- Agregar ítems a `src/data/options.tsx` (id, image, modelo, collection).
- Las imágenes/vídeos en `src/assets/models` o `src/assets/productos`.

Construcción de mensajes WhatsApp
- Usar helpers del módulo `@/lib/whatsapp.ts` en componentes.
- Evitar strings hardcodeados duplicados.

TODO / Próximos pasos
- Agregar ESLint Tailwind plugin y Prettier en devDependencies.
- Opcional: tests de helpers con Vitest.
- Reemplazar `public/assets/locoConClip.png` por el PNG definitivo de marca.

