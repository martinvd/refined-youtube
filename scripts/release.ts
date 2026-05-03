import { readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const tagName = process.argv[2];

if (!tagName) {
  console.error('Usage: bun run release <tag-name>');
  process.exit(1);
}

const tagCheck = Bun.spawn(['git', 'show-ref', '--tags', '--verify', '--quiet', `refs/tags/${tagName}`], {
  cwd: rootDir,
});

if ((await tagCheck.exited) !== 0) {
  console.error(`Git tag "${tagName}" does not exist.`);
  process.exit(1);
}

try {
  await readdir(distDir);
} catch {
  console.error('dist directory not found. Run `bun run build` first.');
  process.exit(1);
}

const archiveName = `refined-youtube-${tagName}.zip`;
const archivePath = resolve(rootDir, archiveName);

await rm(archivePath, { force: true });

const zip = Bun.spawn(['zip', '-r', archivePath, '.'], {
  cwd: distDir,
  stdout: 'inherit',
  stderr: 'inherit',
});

const exitCode = await zip.exited;

if (exitCode !== 0) {
  process.exit(exitCode);
}

console.log(`Created ${archiveName}`);
