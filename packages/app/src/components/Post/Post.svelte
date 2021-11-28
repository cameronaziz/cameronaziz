<script lang="ts">
  import { Card, H2 } from "attractions";

  import { query } from "svelte-apollo";
  import graphql from "../../graphql";

  export let slug: string;

  const post = query<Data.Post>(graphql.GET_POST, {
    variables: {
      slug,
    },
  });

</script>

{#if $post.loading}
  <div>Loading...</div>
{:else if $post.error}
  <div>ERROR: {$post.error}</div>
{:else}
  <Card>
    <H2>{$post.data.post.title}</H2>
    {$post.data.post.content}
  </Card>
{/if}
