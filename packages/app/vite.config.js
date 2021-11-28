import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import postcss from 'rollup-plugin-postcss'
import sveltePreprocess from 'svelte-preprocess';

const config = defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    postcss({
      plugins: [],
    }),
    svelte({
      preprocess: sveltePreprocess(),
    })
  ],

  optimizeDeps: {
    exclude: ['svelte-navigator'],
  },
});

export default config;
