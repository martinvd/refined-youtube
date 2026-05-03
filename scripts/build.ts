import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const packageJson = JSON.parse(await readFile(resolve(rootDir, 'package.json'), 'utf8')) as {
  version: string;
};
const manifest = JSON.parse(await readFile(resolve(rootDir, 'public/manifest.json'), 'utf8')) as {
  version: string;
};

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await writeFile(
  resolve(distDir, 'manifest.json'),
  `${JSON.stringify({ ...manifest, version: packageJson.version }, null, 2)}\n`,
);
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
