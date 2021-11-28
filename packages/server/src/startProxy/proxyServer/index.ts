import httpProxy from 'http-proxy';
import http from 'http';
import { APP_TARGET, KEY_TARGET } from '../../constants';

const proxyServer = () => {
  var proxy = httpProxy.createProxyServer({});
  var server = http.createServer((req, res) => {
    const url = req.url?.toLowerCase();

    if (url === '/api/graphql') {
      proxy.web(req, res, { target: KEY_TARGET });
      return;
    }

    proxy.web(req, res, { target: APP_TARGET });
  });

  server.listen(5050);
  console.log('Started Proxy Server');
};

export default proxyServer;
