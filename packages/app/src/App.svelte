<!-- App.svelte -->
<script>
  import { Router, Route } from "svelte-navigator";
  import Home from "./routes/Home/Home.svelte";
  import NavBar from "./lib/NavBar.svelte";
  import About from "./routes/About/About.svelte";
  import Blog from "./routes/Blog/Blog.svelte";

  export let url = "";

</script>

<Router {url}>
  <NavBar />
  <div>
    <Route path="blog" component={Blog} />
    <Route path="about" component={About} />
    <Route path="/">
      <Home />
    </Route>
  </div>
</Router>
