// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // Automatically resolve these extensions
    },
    hmr: {
      host: '3000-ayoubbkt-recruitpme-it7tchfxocj.ws-eu118.gitpod.io',
      protocol: 'wss'
    }
  }
});