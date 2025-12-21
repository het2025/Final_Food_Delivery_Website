import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['@mui/x-charts', 'd3-array', 'd3-scale', 'd3-format', 'd3-interpolate']
  },
  css: {
    postcss: './postcss.config.js'
  }
});
