<script lang="ts">
  import { H1 } from "attractions";

  import { query } from "svelte-apollo";
  import graphql from "../../graphql";
  import FeedItem from "./FeedItem.svelte";

  const posts = query<Data.Posts>(graphql.GET_POSTS);

</script>

<H1>Blog</H1>

{#if $posts.loading}
  <div>Loading...</div>
{:else if $posts.error}
  <div>ERROR: {$posts.error}</div>
{:else}
  <div class="container">
    {#each $posts.data.posts as post (post.id)}
      <FeedItem {post} />
    {/each}
  </div>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
  }

</style>
