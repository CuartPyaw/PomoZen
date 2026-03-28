import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chromeExtension } from 'vite-plugin-chrome-extension';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/manifest.json'),
    },
  },
  plugins: [react(), chromeExtension()],
});