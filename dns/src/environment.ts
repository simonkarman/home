export const getEnvVar = (name: string) => {
  // eslint-disable-next-line no-process-env
  const val = process.env[name];

  if (val === undefined) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return val;
};
