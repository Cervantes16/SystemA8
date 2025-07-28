import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Asegurarse de que Vite maneje correctamente los archivos estáticos
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Configuración para el servidor de desarrollo
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
