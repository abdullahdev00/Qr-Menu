import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'admin',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './admin'),
      '@/components': resolve(__dirname, './admin/components'),
      '@/lib': resolve(__dirname, './admin/lib'),
      '@/pages': resolve(__dirname, './admin/pages'),
      '@/styles': resolve(__dirname, './admin/styles'),
      '@shared': resolve(__dirname, './shared'),
      '@assets': resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    middlewareMode: true,
  },
});