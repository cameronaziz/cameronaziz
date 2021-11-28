export type Tab =
  | 'Home'
  | 'About'
  | 'Blog';

interface Store {
  tab: Tab | undefined;
}

export as namespace Nav;
