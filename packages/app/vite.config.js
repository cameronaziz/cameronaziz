import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const config = defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    svelte({
      /* plugin options */
    })
  ],
  optimizeDeps: {
    exclude: ['svelte-navigator'],
  },
});

export default config;
