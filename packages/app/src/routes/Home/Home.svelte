<script>
  import { H1 } from "attractions";
  import Counter from "./lib/Counter.svelte";
  import NavBar from "./lib/NavBar.svelte";

</script>

<main class="grid">
  <H1>I'm Cameron Aziz</H1>

  <Counter />

  <p>
    Visit
    <a href="https://svelte.dev">svelte.dev</a>
    to learn how to build Svelte apps.
  </p>

  <p>
    Check out
    <a href="https://github.com/sveltejs/kit#readme">SvelteKit</a>
    for the officially supported framework, also powered by Vite!
  </p>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "nav" "main";
    grid-gap: 1em;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }

</style>
