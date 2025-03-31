import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get the server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://quiz-render-tests.onrender.com';
  }
  return 'http://localhost:3000';
};

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: getServerUrl(),
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          socket: ['socket.io-client']
        }
      }
    }
  }
});