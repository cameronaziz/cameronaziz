import type { ConfigOptions } from './types';

const db: ConfigOptions['db'] = {
  provider: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./keystone.db',
};

export default db;
