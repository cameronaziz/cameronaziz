import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const config = defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    })
  ],

  optimizeDeps: {
    exclude: ['svelte-navigator'],
  },
});

export default config;
