import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron'],
    },
  },
  publicDir: path.resolve(__dirname, 'public'),
});
