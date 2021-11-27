import autopreprocess from "svelte-preprocess";
import svelte from "vite-plugin-svelte";

const preprocess = autopreprocess({
  postcss: {
    plugins: [require("tailwindcss")]
  }
});

export default {
  plugins: [svelte({ preprocess })],
  rollupDedupe: ["svelte"]
};
