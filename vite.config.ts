import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/background.ts'),
      output: {
        dir: resolve(__dirname, 'dist'),
        entryFileNames: 'background.js',
        format: 'iife',
      },
    },
  },
  publicDir: 'public',
});
