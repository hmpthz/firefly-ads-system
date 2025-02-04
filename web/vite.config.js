import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const config = defineConfig({
  /**
   * Actual root path in bundled web page. \
   * Whenver there are dynamically imported assets, or
   * static assets referenced by root relative url in the source code,
   * Vite would automatically replace `"/"` with this root path.
   * @note
   * If you're using React Router + Vercel rewrites, it must be absolute path.
   * Otherwise nested routes will request assets in wrong path.
   */
  base: '/',
  /** it's just `index.html` directory for vite to find */
  root: '',
  /** relative to root */
  publicDir: 'public',

  define: {},
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },

  server: {
    strictPort: true,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8079',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {},
  },

  plugins: [react()],
});

export default defineConfig(({ mode }) => {
  if (mode == 'development') {
  }
  console.log('[Vite Define]', JSON.stringify(config.define, undefined, 2));
  return config;
});
