const pathToString = (path: string): string => {
  const lowercasePath = path.toLowerCase();
  if (lowercasePath === '/') {
    return 'home';
  }
  return lowercasePath.replace(/\//g, '-');
};

const stringToPath = (str: string): string => {
  const path = str.toLowerCase();
  if (path === 'home') {
    return '/';
  }
  return path.replace(/-/g, '/');
};

const pathToTab = (path: string): Nav.Tab | undefined => {
  const basePath = path.split('/');
  if (basePath.length === 1 || basePath.length > 2) {
    return undefined;
  }
  switch (basePath[1]) {
    case '':
      return 'Home';
    case 'about':
      return 'About';
    case 'blog':
      return 'Blog';
    default:
      return undefined;
  }
}

const routes = {
  pathToString,
  pathToTab,
  stringToPath,
};

export default routes;
