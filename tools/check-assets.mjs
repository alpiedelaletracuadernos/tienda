// tools/check-assets.mjs
//
// Verifica que existan en public/ todos los medios que referencia la web,
// incluidas las variantes que piden los componentes (src/lib/media.ts):
// `_thumb.webp` para cada imagen/video y `_poster.webp` para cada video.
// Corre solo antes de `npm run build` (prebuild): un archivo faltante corta
// el build en vez de publicarse como imagen rota.
//
// Uso: npm run check:assets            (falla si falta algo)
//      npm run check:assets -- --unused (lista además lo que no se usa)
import { build } from 'esbuild';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const pub = join(root, 'public');
const src = join(root, 'src');

// Los datos son TS: se bundlean en memoria para leer los valores reales
// (incluidas rutas armadas con template strings).
async function loadData() {
  const result = await build({
    stdin: {
      contents: `export { catalog, productoImagenes } from '@/data/products';
                 export { modeloOptions } from '@/data/options';`,
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    alias: { '@': src },
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const VIDEO_RE = /\.(mp4|webm|mov)$/i;
const EXT_RE = /\.[a-z0-9]+$/i;
const thumbOf = (s) => s.replace(EXT_RE, '_thumb.webp');
const posterOf = (s) => s.replace(EXT_RE, '_poster.webp');

const { catalog, productoImagenes, modeloOptions } = await loadData();

/** ruta relativa a public/ → quién la usa */
const required = new Map();
const need = (path, who) => {
  if (!required.has(path)) required.set(path, who);
};
const needMedia = (path, who) => {
  need(path, who);
  need(thumbOf(path), `${who} (miniatura)`);
  if (VIDEO_RE.test(path)) need(posterOf(path), `${who} (poster)`);
};

for (const p of catalog) p.images.forEach((img) => needMedia(img, `producto "${p.name}"`));
for (const [key, list] of Object.entries(productoImagenes)) {
  list.forEach((img) => needMedia(img, `productoImagenes['${key}']`));
}
for (const m of modeloOptions) {
  need(m.image, `diseño ${m.modelo}`);
  if (m.thumb) need(m.thumb, `diseño ${m.modelo} (miniatura)`);
}

// Rutas literales en componentes (logos, hero, íconos): "assets/..."
for (const file of walk(src).filter((f) => /\.(tsx?|css)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const [, path] of text.matchAll(/["'`(\s](assets\/[\w\-./]+\.(?:webp|png|jpe?g|svg|mp4))/g)) {
    need(path, relative(root, file));
  }
}

const missing = [...required].filter(([path]) => !existsSync(join(pub, path)));

if (process.argv.includes('--unused')) {
  const used = new Set(required.keys());
  const unused = walk(join(pub, 'assets'))
    .map((f) => relative(pub, f))
    .filter((f) => !used.has(f));
  const mb = unused.reduce((a, f) => a + statSync(join(pub, f)).size, 0) / 1024 / 1024;
  console.log(`Sin usar en la web: ${unused.length} archivos (${mb.toFixed(1)} MB)`);
  unused.forEach((f) => console.log(`  ${f}`));
}

if (missing.length) {
  console.error(`✖ Faltan ${missing.length} archivos en public/:`);
  missing.forEach(([path, who]) => console.error(`  ${path}  ← ${who}`));
  console.error('\nGeneralos con: python scripts/optimize_images.py optimizar|videos <carpeta>');
  process.exit(1);
}
console.log(`✔ ${required.size} medios referenciados, ninguno falta.`);
