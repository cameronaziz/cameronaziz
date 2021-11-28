import allStarted from './allStarted';
import proxyServer from './proxyServer';

const startProxy = async () => {
  const isAllStarted = await allStarted();

  if (isAllStarted) {
    proxyServer();
    return;
  }

  console.error('Proxy start failed');
}

export default startProxy;
