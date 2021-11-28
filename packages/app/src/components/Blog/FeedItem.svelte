<script lang="ts">
  import { nav } from "../../stores";
  import type { Schema } from "@typings/post";
  import { Card, H2 } from "attractions";
  import { Link } from "svelte-navigator";

  export let post: Schema;

  const onClick = () => {
    nav.update((store) => {
      store.tab = undefined;
      return store;
    });
  };

</script>

<div class="container">
  <Card outline>
    <div class="card-content">
      <H2>{post.title}</H2>
      <div class="content">{post.content}</div>
      <div class="link">
        <Link to={`/blog/${post.slug}`} onclick={onClick}>Read More</Link>
      </div>
    </div>
  </Card>
</div>

<style>
  .container {
    margin-bottom: 10px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
  }

  .link {
    align-self: end;
  }

  .content {
    height: 8vh;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
  }

</style>
