import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      algorithms: path.resolve(__dirname, './src/algorithms'),
      toolkit: path.resolve(__dirname, './src/toolkit'),
      types: path.resolve(__dirname, './src/types'),
      pages: path.resolve(__dirname, './src/pages'),
    },
  },
  plugins: [svelte()],
});
