import concurrently, { CommandObj } from 'concurrently';
import getScriptType from './getScriptType';
// import startProxy from './startProxy';
import { CONCURRENTLY_OPTIONS } from './constants';

const scriptType = getScriptType();

const commands: CommandObj[] = [
  { command: `yarn workspace @cameronaziz/app ${scriptType}`, name: 'app' },
  { command: `yarn workspace @cameronaziz/key ${scriptType}`, name: 'key' },
];

concurrently(commands, CONCURRENTLY_OPTIONS);
// startProxy();
