// src/lib/share.ts
import vars from '@/data/data';

/**
 * Link para compartir un producto. Apunta a la página estática que genera
 * tools/build-share-pages.mjs (con título, descripción e imagen del producto
 * para la vista previa) y que redirige a la ficha.
 */
export const shareUrlFor = (slug: string) => `${vars.siteUrl}p/${slug}/`;
