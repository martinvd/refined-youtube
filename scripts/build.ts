import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(resolve(rootDir, 'public/manifest.json'), resolve(distDir, 'manifest.json'));
await cp(resolve(rootDir, 'public/options.html'), resolve(distDir, 'options.html'));

const result = await Bun.build({
  entrypoints: [
    resolve(rootDir, 'src/background.ts'),
    resolve(rootDir, 'src/content.ts'),
    resolve(rootDir, 'src/options.ts'),
  ],
  outdir: distDir,
  target: 'browser',
  format: 'iife',
  naming: '[dir]/[name].[ext]',
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }

  process.exit(1);
}
