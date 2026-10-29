/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 3000 },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Readable names so a template's catalogue, and the screenshot library, can be told apart in the network panel.
        manualChunks(id) {
          const template = /[\\/]src[\\/]templates[\\/](herbal|gadgets|fashion|marketplace|wellness)[\\/](config|products)\.ts$/.exec(id);
          if (template) return `tpl-${template[1]}`;
          // Code every template uses lives apart, so no template's chunk has to pull in another's.
          // (A manual chunk also absorbs its dependencies, so the shared ones are named here: the helper, the money
          // formatter, and each template's small meta file, which the app itself loads at start.)
          if (/[\\/]src[\\/]templates[\\/](helpers|[a-z]+[\\/]meta)\.ts$/.test(id) || /[\\/]src[\\/]lib[\\/]format\.ts$/.test(id)) return 'tpl-shared';
          if (/node_modules[\\/]html-to-image/.test(id)) return 'html-to-image';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
