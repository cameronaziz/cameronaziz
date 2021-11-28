import { list } from '@keystone-next/keystone';
import { relationship, text } from '@keystone-next/keystone/fields';

const Author = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    posts: relationship({ ref: 'Post.author', many: true }),
  },
});

export default Author;
