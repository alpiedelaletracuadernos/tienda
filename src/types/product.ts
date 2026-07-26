export type ProductCategory =
  | 'agendas'
  | 'cuadernos'
  | 'recetarios'
  | 'libretas'
  | 'agendas docentes'
  | 'especiales'
  | 'planners';

export type ProductSize = 'A5' | 'A4';

export type ModelAssets = {
  [key: string]: string[];
};

export type ModeloType = {
  id: string;
  image: string; // URL de la miniatura
  modelo: string; // ej: "semanal", "dos-dias", "universitaria", etc.
};

/**
 * Un diseño de tapa del catálogo (`src/data/options.tsx`).
 * Vive acá y no en el componente que lo dibuja porque los datos no deben
 * depender de la capa de UI: `DesignPicker` es hoy quien lo renderiza, pero
 * mañana puede ser otro.
 */
export type DesignOption = {
  id: string;
  image: string; // URL de la miniatura
  modelo: string; // ej: "48"
  collection: string; // ej: "Edicion-2026"
};

export type InteriorType =
  | 'semanal'
  | 'dos-por-hoja'
  | 'universitaria'
  | 'docente'
  | 'perpetua'
  | 'rayado'
  | 'liso'
  | 'cuadriculado'
  | 'recetas'
  | 'Docente nivel inicial'
  | 'Docente nivel primario'
  | 'Docente nivel secundario/universitario'
  | 'Cuaderno con planner'
  | 'Cuaderno hojas rayadas'
  | 'Cuaderno hojas cuadriculadas'
  | 'Cuaderno hojas lisas'
  | 'Cuaderno hojas puntilladas'
  | 'Cuaderno emprendedor'
  | '2 pedidos por hoja'
  | '3 pedidos por hoja'
  | '6 pedidos por hoja'
  | 'Cuaderno docente inicial perpetuo'
  | 'Cuaderno docente primaria perpetuo'
  | 'Cuaderno docente secundaria perpetuo'
  | 'Planner semanal perpetuo con horarios';

export type CoverType = 'dura' | 'blanda';

export type ProductColor = { id: string; name: string; hex: string };

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  basePrice: number;
  sizes: ProductSize[];
  interiors: InteriorType[];
  coverTypes: CoverType[];
  images: string[];
  materials: string[];
  includes: string[];
  productionTime: string;
  inStock: boolean;
  weeklyQuota: number;
  remainingQuota: number;
  colors?: ProductColor[];
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    basePrice: number;
    // ...lo que ya tengas
  };
  quantity: number;
  price: number; // unitario que guardás
  // 🔹 Campos opcionales para personalización:
  personalization?: string;
  selectedModel?: string; // <-- agregar
  selectedSize?: ProductSize; // <-- agregar (si lo guardás)
  selectedInterior?: InteriorType; // <-- agregar
  selectedCover?: CoverType; // <-- agregar
}
