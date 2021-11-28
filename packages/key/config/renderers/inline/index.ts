import { DocumentRendererProps } from '@keystone-next/document-renderer';
import image from './image';

const renderers: DocumentRendererProps['renderers'] = {
  inline: {
    relationship({ relationship, data }) {
      if (relationship === 'image') {
        return image(data)
      }
      return null;
    },
  },
};

export default renderers;
