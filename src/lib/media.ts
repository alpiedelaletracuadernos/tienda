// src/lib/media.ts
//
// Convención de archivos de medios (la genera scripts/optimize_images.py y la
// verifica `npm run check:assets` antes de cada build):
//   nombre.webp         imagen grande (lado máx. 1200px)
//   nombre_thumb.webp   miniatura (lado máx. 400px), también para videos
//   nombre.mp4          video
//   nombre_poster.webp  primer cuadro del video
// Los componentes piden la variante por acá en vez de armar rutas a mano.

const VIDEO_RE = /\.(mp4|webm|mov)$/i;
const EXT_RE = /\.[a-z0-9]+$/i;

export const isVideo = (src: string) => VIDEO_RE.test(src);

/** Miniatura de 400px de una imagen o video. */
export const thumbOf = (src: string) => src.replace(EXT_RE, '_thumb.webp');

/** Primer cuadro de un video, para el atributo `poster`. */
export const posterOf = (src: string) => src.replace(EXT_RE, '_poster.webp');

/** Imagen fija que representa un medio (el poster si es video). */
export const stillOf = (src: string) => (isVideo(src) ? posterOf(src) : src);

/**
 * `srcSet` con miniatura y grande, para que el navegador elija según el
 * ancho real en pantalla (una card de 350px en un celu 2x usa la grande).
 */
export const responsiveSrcSet = (src: string) => {
  const still = stillOf(src);
  return `${thumbOf(src)} 400w, ${still} 1200w`;
};
