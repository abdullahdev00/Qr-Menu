import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, './components'),
      '@/lib': resolve(__dirname, './lib'),
      '@/pages': resolve(__dirname, './pages'),
      '@/styles': resolve(__dirname, './styles'),
      '@shared': resolve(__dirname, './shared'),
      '@assets': resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    middlewareMode: true,
  },
});