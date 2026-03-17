# Guía de Arquitectura para Agentes de IA (AGENTS.md)

Este documento está diseñado para proporcionar a los agentes de IA y desarrolladores un resumen estructurado del proyecto "alPie", de manera que puedan comprender rápidamente las funcionalidades, ubicación de archivos y la configuración actual para realizar futuras implementaciones.

## 📌 1. Stack Tecnológico
- **Core:** React 18, TypeScript, Vite
- **Enrutamiento:** `react-router-dom` v6 (`HashRouter` centralizado en `src/App.tsx`).
- **Estado Global:** `zustand` (con persistencia en localStorage para el carrito).
- **Estilos:** Tailwind CSS con `tailwind-merge` y `clsx`.
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Componentes exportados en `src/components/ui/*.tsx`), Radix UI.
- **Data Fetching/State:** `@tanstack/react-query` (Configurado en `App.tsx`).
- **Manejo de Formularios & Validación:** `react-hook-form` + `zod`.
- **Iconos:** `lucide-react`.
- **Notificaciones/Alertas:** `sonner` y el Toast nativo de Shadcn.

---

## 📂 2. Estructura de Directorios Principal

El código fuente principal está en la carpeta `/src`. La estructura está basada en características (features) y capas:

- `src/App.tsx`: Archivo de entrada de rutas (`HashRouter`) y proveedores globales.
- `src/main.tsx`: Punto de montaje de la app React.
- `src/components/`: Componentes modulares y reutilizables.
  - `ui/`: Componentes de UI base generados por Shadcn UI.
  - `home/`, `layout/`, `products/`, `promos/`: Componentes ordenados funcionalmente.
  - *Archivos sueltos:* `ScrollToTop.tsx`, `WhatsAppButton.tsx`.
- `src/pages/`: Las vistas principales atadas a una ruta.
- `src/hooks/`: Hooks personalizados y gestión de estado global (`zustand`).
- `src/data/`: Datos crudos (Mocks) que actúan como "base de datos" estática (`products.ts`, `data.ts`).
- `src/lib/`: Utilidades generales (cálculo de precios, armado de link de WhatsApp, formateo de moneda).
- `src/types/`: Interfaces de TypeScript compartidas (`product.ts`, `cart.ts`).
- `src/config/`: Configuraciones de negocio (ej. reglas de promociones en `promotions.ts`).

---

## 🛍️ 3. Rutas y Vistas Activas (`src/pages/`)

| Ruta React-Router | Componente (dentro de `pages/`) | Descripción de la Vista |
| --- | --- | --- |
| `/` | `Index.tsx` | Landing page principal / Home. |
| `/catalogo` | `Shop.tsx` | Listado completo de productos (Catálogo). |
| `/producto/:slug` | `ProductDetail.tsx` | Detalle específico de un producto. |
| `/carrito` | `Cart.tsx` | Página del carrito con el listado de elementos seleccionados. |
| `/checkout` | `Checkout.tsx` | Formulario de datos del usuario, cálculos de envío/descuento y checkout. |
| `/gracias` | `ThankYou.tsx` o `Gracias.tsx`| Pantalla final ("Thank you") posterior al checkout. |
| `*` | `NotFound.tsx` | Catch-all para rutas inexistentes (Error 404). |

---

## 🛒 4. Metodología del Carrito de Compras (`src/hooks/use-cart.ts`)

La lógica del carrito está gestionada mediante `zustand` y localizada en el custom hook **`use-cart.ts`**.

### Características de la implementación:
- **Persistencia:** Está envuelto en el middleware `persist` de Zustand y se guarda en `localStorage` bajo la key `cart:v3`.
- **Estructura del Estore:**
  - `items`: Un Array con objetos `CartItem` (Ver interfaz en `src/types/cart.ts`).
- **Identificación de productos únicos:** Determina si un ítem en el carrito es un "duplicado" no solo por su `productId`, sino por la combinación de variaciones seleccionadas: `size`, `interior`, `cover`, y `personalization` (Texto personalizado). Si estas opciones coinciden con un ítem existente, **suma la cantidad** en lugar de crear un ítem nuevo.
- **Acciones Disponibles:**
  - `addItem(item)`: Agrega un nuevo producto o suma cantidad.
  - `removeItem(productId, size, interior, cover, personalization)`: Elimina la variante exacta de un ítem.
  - `updateQuantity(...)`: Cambia la cantidad (asegurando un mínimo de `1`).
  - `clearCart()`: Vacía el array de ítems.
- **Cálculo de Precios Avanzado:** 
  Utiliza utilidades externas ubicadas en `src/lib/pricing/calc-cart-pricing.ts` para extraer subtotal, descuentos de promociones (`getPromoDiscount`) y precio final (`getTotalPrice`). 
  *Nota: El descuento promocional toma sus reglas maestras de `src/config/promotions.ts`.*

---

## 🛠️ 5. Funcionalidades Esenciales & Utilitarios (`src/lib/`)

- **Checkout hacia WhatsApp:**
  El proceso de cierre de venta ("checkout") no integra una pasarela de pago nativa; en su lugar, el formulario recopila la información del usuario en `Checkout.tsx` y utiliza la utilidad **`src/lib/whatsapp.ts`** para codificar la orden en un mensaje de texto. Este texto se pasa a un link de `wa.me/` que redirige al usuario con el comercio a través de WhatsApp.
  
- **Utilidades de Precio (`src/lib/pricing/` & `currency.ts`):** 
  Todos los cálculos deben pasar por las funciones provistas aquí en vez de ser procesados crudamente en el frontend o componentes para mantener sincronía en promociones y descuentos.

- **Centralización de Configuración y Promociones (`src/data/data.ts`):** 
  Las métricas de negocio, precios de personalización y las variables de promoción de productos (activación de 2x1, exclusión de ítems personalizados, y porcentajes de descuento) están contenidas todas dentro de `AppVars` (en el objeto `vars`). **Ningún componente debe consultar a `.env` directamente.**

---

## 🚀 6. Consideraciones para Futuras Implementaciones

Si un agente de IA necesita modificar o agregar algo a este proyecto, debe seguir estar reglas de oro:

1. **Uso de Componentes UI Base:** Al necesitar inputs, modales, alertas o botones, primero revise si existe el componente correspondiente en `src/components/ui/`, ya que este proyecto utiliza **Shadcn UI**.
2. **Nuevos Atributos de Producto:** Si se agregan propiedades parametrizables para la venta (ej. *Material*, *Grosor*), no olvide:
   - Modificar las interfaces en `src/types/cart.ts` y `src/types/product.ts`.
   - Modificar el sistema de "identidad única en carrito" en `src/hooks/use-cart.ts` (métodos `addItem`, `removeItem`, `updateQuantity`).
3. **Caché y Data Fetching:** Cuando se migre de productos mockeados (`src/data/products.ts`) a un backend real, utilice los hooks de `@tanstack/react-query` ya que el `QueryClientProvider` se encuentra ya conectado en `App.tsx`.
4. **Agregado de Rutas:** Si se necesita crear una nueva página (ej. "FAQ", "Contacto"), cree el archivo en `src/pages/`, y añada la etiqueta `<Route />` correspondiente en `src/App.tsx` ¡SIEMPRE por encima de la ruta `path="*"`!. 
5. **Estilos y Clases de Tailwind:** Utilice el hook utilitario local `cn()` importado típicamente desde `@/lib/utils` o similar para combinar clases de Tailwind si se usan variables dinámicas o `clsx`.
6. **Manejo de Formularios en nuevas vistas:** Preferir `react-hook-form` integrado con resolutores de esquemas `zod` (`@hookform/resolvers/zod`), siguiendo el estándar ya aplicado posiblemente en `Checkout.tsx`.
