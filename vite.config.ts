import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(//{
      //fastRefresh: false, // Disable React Refresh
  //  }
  )],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
