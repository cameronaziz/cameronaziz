import { PROXY_START_TRIES, PROXY_START_TIMEOUTS } from '../../constants';
import inUse from './inUse';

const timeout = (seconds: number) =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000));

const checkPort = async (port: number, retryCount: number = 0): Promise<boolean> => {
  if (retryCount >= PROXY_START_TRIES) {
    return false
  }

  const portInUse = await inUse(port);
  if (portInUse) {
    console.log(`Server on port ${port} has started`);
    return true;
  }

  const waitTime = retryCount < PROXY_START_TIMEOUTS.length ? PROXY_START_TIMEOUTS[retryCount] : PROXY_START_TIMEOUTS[PROXY_START_TIMEOUTS.length - 1];
  console.log(`Server on port ${port} hasn't started, waiting ${waitTime} seconds.`);

  await timeout(waitTime);
  return checkPort(port, retryCount + 1);
};

export default checkPort;
