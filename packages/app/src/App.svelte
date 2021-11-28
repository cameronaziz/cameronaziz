<script lang="ts">
  import { InMemoryCache, ApolloClient } from "@apollo/client";
  import { setClient } from "svelte-apollo";
  import { Router, Route } from "svelte-navigator";
  import Home from "./components/Home/Home.svelte";
  import NavBar from "./components/NavBar/NavBar.svelte";
  import About from "./components/About/About.svelte";
  import Blog from "./components/Blog/Blog.svelte";
  import Post from "./components/Post/Post.svelte";

  export let url = window.location.pathname;

  const client = new ApolloClient({
    uri: "http://localhost:5050/api/graphql",
    cache: new InMemoryCache(),
  });
  setClient(client);

</script>

<main>
  <Router {url}>
    <NavBar />
    <div>
      <Route path="blog">
        <Blog />
      </Route>
      <Route path="blog/:slug" let:params>
        <Post slug={params.slug} />
      </Route>
      <Route path="about" component={About} />
      <Route path="/">
        <Home />
      </Route>
    </div>
  </Router>
</main>

<style>
  main {
    padding: 2vh 4vw;
  }

</style>
