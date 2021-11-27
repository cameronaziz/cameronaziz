<script>
  import { Tabs } from "attractions";
  import { navigate } from "svelte-routing";

  let selectedTab = "Home";
  let items = ["Home", "About", "Blog"];

  const navigateTo = ({ value }) => {
    const path = value.toLowerCase();
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
