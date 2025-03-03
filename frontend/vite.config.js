// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Treat .js files as containing JSX
    loader: 'jsx',
    include: [
      // Include all .js files in src/ that might contain JSX
      'src/**/*.js',
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',

    hmr: {
      host: '3000-ayoubbkt-recruitpme-it7tchfxocj.ws-eu118.gitpod.io',
      protocol: 'wss'
    }
  }
});