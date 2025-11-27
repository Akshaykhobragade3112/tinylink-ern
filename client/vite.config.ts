// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
      '/healthz': 'http://localhost:4000',
      // redirect /:code is handled directly by backend, not proxied by SPA
    },
  },
});
