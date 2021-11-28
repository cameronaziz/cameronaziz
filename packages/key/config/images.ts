import type { ConfigOptions } from './types';

const images: ConfigOptions['images'] = {
  upload: 'local',
  local: {
    storagePath: 'public/images',
    baseUrl: '/images',
  },
};

export default images;
