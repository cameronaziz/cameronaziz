import { config } from '@keystone-next/keystone';
import schema from './config';

const keystone = config({
  db: schema.db,
  images: schema.images,
  lists: schema.lists,
});

export default keystone;
