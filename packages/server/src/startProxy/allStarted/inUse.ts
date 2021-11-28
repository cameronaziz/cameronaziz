import netstat from 'node-netstat';

const inUse = (port: number) => new Promise<boolean>((resolve) => {
  console.log(`Testing port ${port}.`);

  netstat({}, (data) => {
    const isPort = data.local.port === port;
    if (!isPort) {
      return;
    }

    data.state == 'ESTABLISHED' ? resolve(true) : resolve(false);
  });
});


export default inUse;
