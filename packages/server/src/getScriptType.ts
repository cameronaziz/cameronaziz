const getScriptType = (): string => {
  const args = process.argv.slice(2);

  const isDev = args.find((arg) => arg.startsWith('--dev'));
  if (isDev) {
    return 'dev';
  }
  const isBuild = args.find((arg) => arg.startsWith('--dev'));
  if (isBuild) {
    return 'build';
  }

  return 'start';
};

export default getScriptType;
