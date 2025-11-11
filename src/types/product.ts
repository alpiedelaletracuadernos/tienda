export type ProductCategory = 'agendas' | 'cuadernos' | 'recetarios' | 'libretas' |'agendas docentes'|'especiales';

export type ProductSize = 'A5' | 'A4' 

export type ModelAssets = {
  [key: string]: string[];
};

export type ModeloType = {
  id: string;
  image: string;   // URL de la miniatura
  modelo: string;  // ej: "semanal", "dos-dias", "universitaria", etc.
}

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
  |'Docente nivel inicial'
  |'Docente nivel primario'
  |'Docente nivel secundario/universitario'
  |'Cuaderno con planner'
  |'Cuaderno hojas rayadas'
  |'Cuaderno hojas cuadriculadas'
  |'Cuaderno hojas lisas'
  |'Cuaderno hojas puntilladas'
  |'Cuaderno emprendedor'
  |'2 pedidos por hoja'
  |'3 pedidos por hoja'
  |'6 pedidos por hoja'
  |'Cuaderno docente inicial perpetuo'
  |'Cuaderno docente primaria perpetuo'
  |'Cuaderno docente secundaria perpetuo'
  |'Planner semanal perpetuo con horarios';

export type CoverType = 'dura' | 'blanda';

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
  selectedModel?: string;            // <-- agregar
  selectedSize?: ProductSize;        // <-- agregar (si lo guardás)
  selectedInterior?: InteriorType;   // <-- agregar
  selectedCover?: CoverType;         // <-- agregar
}
