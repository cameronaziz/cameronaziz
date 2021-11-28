import { writable } from 'svelte/store';
import utils from "../utils";

const initialStore: Nav.Store = {
  tab: utils.routes.pathToTab(
    window.location.pathname
  ),
};

const nav = writable(initialStore);

export default nav;
