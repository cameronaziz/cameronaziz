import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp, image } from '@keystone-next/keystone/fields';
import fields from '../fields';

const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    headerImage: image(),
    slug: fields.slug,
    status: select({
      type: 'enum',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    }),
    content: text({
      ui: {
        displayMode: 'textarea'
      }
    }),
    publishDate: timestamp(),
    author: relationship({
      ref: 'Author.posts',
      many: false,
    }),
  },
});

export default Post;
