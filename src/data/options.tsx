import { DesignOption } from '@/types/product';

const routeBase = 'assets/';

// Sólo se ofrece la Edición 2027, numerada del 1 al 16 (`modelo`, lo que ve
// el cliente). Las colecciones anteriores están archivadas en
// `options-archivo.ts`. Los ids internos siguen la numeración histórica
// (66 en adelante) para no reutilizar ids viejos que puedan estar guardados
// en el navegador del cliente.
export const modeloOptions: DesignOption[] = [
  {
    id: '66',
    image: `${routeBase}models/edicion-2027_0001.webp`,
    thumb: `${routeBase}models/edicion-2027_0001_thumb.webp`,
    modelo: '1',
    collection: 'Edicion-2027',
  },
  {
    id: '67',
    image: `${routeBase}models/edicion-2027_0002.webp`,
    thumb: `${routeBase}models/edicion-2027_0002_thumb.webp`,
    modelo: '2',
    collection: 'Edicion-2027',
  },
  {
    id: '68',
    image: `${routeBase}models/edicion-2027_0003.webp`,
    thumb: `${routeBase}models/edicion-2027_0003_thumb.webp`,
    modelo: '3',
    collection: 'Edicion-2027',
  },
  {
    id: '69',
    image: `${routeBase}models/edicion-2027_0004.webp`,
    thumb: `${routeBase}models/edicion-2027_0004_thumb.webp`,
    modelo: '4',
    collection: 'Edicion-2027',
  },
  {
    id: '70',
    image: `${routeBase}models/edicion-2027_0005.webp`,
    thumb: `${routeBase}models/edicion-2027_0005_thumb.webp`,
    modelo: '5',
    collection: 'Edicion-2027',
  },
  {
    id: '71',
    image: `${routeBase}models/edicion-2027_0006.webp`,
    thumb: `${routeBase}models/edicion-2027_0006_thumb.webp`,
    modelo: '6',
    collection: 'Edicion-2027',
  },
  {
    id: '72',
    image: `${routeBase}models/edicion-2027_0007.webp`,
    thumb: `${routeBase}models/edicion-2027_0007_thumb.webp`,
    modelo: '7',
    collection: 'Edicion-2027',
  },
  {
    id: '73',
    image: `${routeBase}models/edicion-2027_0008.webp`,
    thumb: `${routeBase}models/edicion-2027_0008_thumb.webp`,
    modelo: '8',
    collection: 'Edicion-2027',
  },
  {
    id: '74',
    image: `${routeBase}models/edicion-2027_0009.webp`,
    thumb: `${routeBase}models/edicion-2027_0009_thumb.webp`,
    modelo: '9',
    collection: 'Edicion-2027',
  },
  {
    id: '75',
    image: `${routeBase}models/edicion-2027_0010.webp`,
    thumb: `${routeBase}models/edicion-2027_0010_thumb.webp`,
    modelo: '10',
    collection: 'Edicion-2027',
  },
  {
    id: '76',
    image: `${routeBase}models/edicion-2027_0011.webp`,
    thumb: `${routeBase}models/edicion-2027_0011_thumb.webp`,
    modelo: '11',
    collection: 'Edicion-2027',
  },
  {
    id: '77',
    image: `${routeBase}models/edicion-2027_0012.webp`,
    thumb: `${routeBase}models/edicion-2027_0012_thumb.webp`,
    modelo: '12',
    collection: 'Edicion-2027',
  },
  {
    id: '78',
    image: `${routeBase}models/edicion-2027_0013.webp`,
    thumb: `${routeBase}models/edicion-2027_0013_thumb.webp`,
    modelo: '13',
    collection: 'Edicion-2027',
  },
  {
    id: '79',
    image: `${routeBase}models/edicion-2027_0014.webp`,
    thumb: `${routeBase}models/edicion-2027_0014_thumb.webp`,
    modelo: '14',
    collection: 'Edicion-2027',
  },
  {
    id: '80',
    image: `${routeBase}models/edicion-2027_0015.webp`,
    thumb: `${routeBase}models/edicion-2027_0015_thumb.webp`,
    modelo: '15',
    collection: 'Edicion-2027',
  },
  {
    id: '81',
    image: `${routeBase}models/edicion-2027_0016.webp`,
    thumb: `${routeBase}models/edicion-2027_0016_thumb.webp`,
    modelo: '16',
    collection: 'Edicion-2027',
  },
];

/** Numeración anterior de la Edición 2027 (66–81) → la actual (1–16). */
export const modeloRenumerado: Record<string, string> = Object.fromEntries(
  modeloOptions.map((m) => [m.id, m.modelo])
);
