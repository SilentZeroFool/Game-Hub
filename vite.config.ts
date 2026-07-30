import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        '@tauri-apps/api/tauri',
        '@tauri-apps/api/window',
        '@tauri-apps/api/core'
      ]
    },
    ssr: {
      noExternal: ['@tauri-apps/api']
    },
    build: {
      rollupOptions: {
        external: [
          '@tauri-apps/api',
          '@tauri-apps/api/tauri',
          '@tauri-apps/api/window',
          '@tauri-apps/api/core'
        ]
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
