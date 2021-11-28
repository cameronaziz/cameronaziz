import { text } from '@keystone-next/keystone/fields';

const slug = text({
  isIndexed: 'unique',
  validation: {
    isRequired: true,
    match: {
      regex: /^[a-z0-9-]+$/,
      explanation: 'Must only contain lowercase letters, numbers and hyphens.',
    },
  },
});

export default slug;
