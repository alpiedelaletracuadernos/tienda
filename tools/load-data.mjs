// tools/load-data.mjs
// Los datos de la tienda son TS: se bundlean en memoria con esbuild para que
// los scripts de tools/ lean los valores reales (incluidas rutas armadas con
// template strings) sin duplicarlos.
import { build } from 'esbuild';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(fileURLToPath(import.meta.url), '../..');

export async function loadData() {
  const result = await build({
    stdin: {
      contents: `export { catalog, products, productoImagenes } from '@/data/products';
                 export { modeloOptions } from '@/data/options';
                 export { vars } from '@/data/data';
                 export { INTERIOR_INFO } from '@/data/interiors';`,
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    alias: { '@': join(root, 'src') },
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
