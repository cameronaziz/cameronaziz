<script lang="ts">
  import type { Tab } from "@typings/nav";
  import { nav } from "../../stores";
  import { Tabs } from "attractions";
  import { navigate } from "svelte-navigator";
  import utils from "../../utils";

  let selectedTab: Tab | undefined = $nav.tab;

  let items: Tab[] = ["Home", "About", "Blog"];

  const navigateTo = ({ detail }) => {
    const path = utils.routes.pathToString(detail.value);
    nav.set({ tab: detail.value });
    navigate(`/${path == "home" ? "" : path}`);
  };

</script>

<div class="nav-bar">
  <Tabs name="menu" {items} on:change={navigateTo} bind:value={selectedTab} />
</div>

<style>
  .nav-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

</style>
