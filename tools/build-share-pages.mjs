// tools/build-share-pages.mjs
//
// La tienda usa HashRouter (`/tienda/#/producto/x`): WhatsApp, Instagram y
// Facebook no leen lo que va después del `#`, así que todo link compartido
// mostraba la misma vista previa genérica. Este script (corre en postbuild)
// genera una página estática por producto publicado:
//
//   dist/p/<slug>/index.html  →  título, descripción e imagen del producto
//                                 en Open Graph + redirección a la ficha.
//
// La ficha comparte ese link (ver `shareUrlFor` en src/lib/share.ts).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, root } from './load-data.mjs';

const dist = join(root, 'dist');
if (!existsSync(dist)) {
  console.error('No existe dist/: corré primero vite build.');
  process.exit(1);
}

const { products, vars } = await loadData();
const site = vars.siteUrl;

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const VIDEO_RE = /\.(mp4|webm|mov)$/i;
const stillOf = (src) => (VIDEO_RE.test(src) ? src.replace(/\.[a-z0-9]+$/i, '_poster.webp') : src);

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

for (const p of products) {
  const target = `${site}#/producto/${p.slug}`;
  const image = p.images[0] ? `${site}${stillOf(p.images[0])}` : `${site}og-image.jpg`;
  const title = `${p.name} · Al Pie de la Letra`;
  const description = truncate(p.description.replace(/\s+/g, ' ').trim(), 200);
  const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(target)}" />
<meta property="og:type" content="product" />
<meta property="og:locale" content="es_AR" />
<meta property="og:site_name" content="Al Pie de la Letra" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(`${site}p/${p.slug}/`)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
<script>location.replace(${JSON.stringify(target)});</script>
</head>
<body>
<p><a href="${esc(target)}">Ver ${esc(p.name)}</a></p>
</body>
</html>
`;
  const dir = join(dist, 'p', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

console.log(`✔ ${products.length} páginas para compartir en dist/p/`);
