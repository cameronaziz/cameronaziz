import type { Options } from 'concurrently';

const LOCATION = 'http://localhost';

const KEY_PORT = 3000;
const KEY_TARGET = `${LOCATION}:${KEY_PORT}`;

const APP_PORT = 4000;
const APP_TARGET = `${LOCATION}:${APP_PORT}`;

const PORTS = [
  KEY_PORT,
  APP_PORT,
];

const CONCURRENTLY_OPTIONS: Options = {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
};

const PROXY_START_TRIES = 3;
const PROXY_START_TIMEOUTS = [
  5,
  15,
  30,
  60,
];

export {
  APP_PORT,
  APP_TARGET,
  CONCURRENTLY_OPTIONS,
  KEY_PORT,
  KEY_TARGET,
  PORTS,
  PROXY_START_TIMEOUTS,
  PROXY_START_TRIES,
};
