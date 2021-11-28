import { PORTS } from '../../constants';
import checkPort from './checkPort';

const allStarted = async (): Promise<boolean> => {
  const portsStarted = PORTS.map((port) => checkPort(port));
  const portsInUse = await Promise.all(portsStarted);
  return portsInUse.every((portInUse) => !!portInUse);
};

export default allStarted;
