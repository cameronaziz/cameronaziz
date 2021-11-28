import { list } from '@keystone-next/keystone';
import { image, text, timestamp } from '@keystone-next/keystone/fields';

const Image = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    content: image(),
    publishDate: timestamp(),
  },
});

export default Image;
