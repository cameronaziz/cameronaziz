import { ListSchemaConfig } from '@keystone-next/keystone';
import Post from './Post';
import Author from './Author';
import Image from './Image';

const lists: ListSchemaConfig = {
  Author: Author,
  Image: Image,
  Post: Post,
};

export default lists;
