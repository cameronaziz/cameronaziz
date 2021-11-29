const environment = process.env.NODE_ENV;

const getKeyURL = () => {
  switch (environment) {
    case 'production': return 'https://cameronaziz-keystone-keystone.up.railway.app';
    case 'staging': return 'https://cameronaziz-keystone-staging.up.railway.app';
    default: return 'http://localhost:5050';
  }
};

const environments = {
  getKeyURL,
};

export default environments;
