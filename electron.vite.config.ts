import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    // Configuración de Vite para el proceso principal
    build: {
      rollupOptions: {
        external: ['electron'],
      },
      lib: {
        entry: 'electron/main.ts',
      },
    },
  },
  preload: {
    // Configuración de Vite para los scripts de precarga
    build: {
      rollupOptions: {
        external: ['electron'],
      },
      lib: {
        entry: 'electron/preload.ts',
      },
    },
  },
  renderer: {
    // Configuración de Vite para el proceso de renderizado (React)
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
    plugins: [react()],
  },
});