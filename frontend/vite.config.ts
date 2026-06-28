import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import unoConfig from './src/features/cv_builder/uno.config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const cvLib = path.resolve(rootDir, 'src/features/cv_builder/src/lib');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const hasAuth0 =
    Boolean(env.VITE_AUTH0_DOMAIN?.trim()) && Boolean(env.VITE_AUTH0_CLIENT_ID?.trim());
  console.log(
    `[vite] Auth0 env at build: domain=${env.VITE_AUTH0_DOMAIN ? 'set' : 'MISSING'}, clientId=${env.VITE_AUTH0_CLIENT_ID ? 'set' : 'MISSING'}`,
  );
  if (mode === 'production' && !hasAuth0) {
    console.warn(
      '[vite] VITE_AUTH0_DOMAIN / VITE_AUTH0_CLIENT_ID are empty — set them in Vercel Environment Variables and redeploy.',
    );
  }

  return {
  envDir: rootDir,
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['@excalidraw/excalidraw'],
  },
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
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(rootDir, 'src'),
      $lib: cvLib,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@excalidraw/excalidraw')) return 'vendor-excalidraw';
            if (id.includes('@tiptap/')) return 'vendor-tiptap';
            if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
            if (id.includes('konva') || id.includes('react-konva')) return 'vendor-konva';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@auth0/auth0-react')) return 'vendor-auth0';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
          if (id.includes('/features/cv_builder/')) return 'feature-cv-builder';
        },
      },
    },
  },
  };
});
