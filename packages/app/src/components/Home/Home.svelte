<script>
  import { H1 } from "attractions";
  const src = "assets/cameron_aziz.jpeg";

</script>

<main class="grid">
  <div class="hero">
    <H1>I'm Cameron Aziz</H1>
    <div class="image-container"><img {src} alt="Cameron Aziz Profile" /></div>
  </div>
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

  .hero {
    display: grid;
    height: 50vh;
    margin: 5vw;
    padding: 3vw;
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
    grid-template-columns: 2fr 1fr;
  }

  .hero .image-container {
    overflow: hidden;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "nav" "main";
    grid-gap: 1em;
  }
</style>
