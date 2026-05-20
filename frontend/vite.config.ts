import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import unoConfig from './src/features/cv_builder/uno.config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const cvLib = path.resolve(rootDir, 'src/features/cv_builder/src/lib');

export default defineConfig({
  plugins: [
    UnoCSS(unoConfig),
    svelte({
      include: [/cv_builder\/.*\.svelte$/, /cv\/quickcv\/.*\.svelte$/],
    }),
    react(),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      $lib: cvLib,
    },
  },
});
