import path from 'path';
import fs from 'fs';
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

  define: {
    VERCEL: process.env.VERCEL === '1',
    SUPABASE_URL: '"https://stiuxjzdafqndcrgkfrn.supabase.co"',
    DEBUG_IGNORE_TOKEN: false
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, '../../utils')
    }
  },

  server: {
    strictPort: true,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8079',
        changeOrigin: true,
        secure: false
      },
    }
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {

    }
  },

  plugins: [
    react(),
    (function () {
      let outDir = ''; // this context in plugin hooks doesn't point to object
      function copyToOutDir(src, dest) {
        fs.copyFileSync(path.resolve(import.meta.dirname, src), path.resolve(outDir, dest));
      };
      return {
        name: 'postbuild-plugin',
        apply: 'build',
        configResolved(config) {
          outDir = config.build.outDir;
        },
        closeBundle() {
          fs.mkdirSync(path.resolve(outDir, 'readme'));
          copyToOutDir('../../README.html', 'readme/index.html');
          copyToOutDir('../../README.md', 'readme/README.md');
        }
      };
    })()
  ]
});

export default defineConfig(({ mode }) => {
  if (mode == 'development') {
    // config.define.DEBUG_IGNORE_TOKEN = true;
  }
  console.log('[Vite Define]', JSON.stringify(config.define, undefined, 2));
  return config;
})