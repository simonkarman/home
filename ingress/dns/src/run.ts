import { dns } from './neostrada';
import { portForwarding } from './zyxel';

export const getEnvVar = (name: string) => {
  // eslint-disable-next-line no-process-env
  const val = process.env[name];
  if (val === undefined) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return val;
};

const mode = getEnvVar('MODE') as 'enable' | 'disable';
const enable = mode === 'enable';
const message = enable ? 'Enabling' : 'Disabling';

(async () => {
  const neostradaApiKey = getEnvVar('NEOSTRADA_API_KEY');
  const domainName = 'karman.dev';
  const assignedRecords = ['home', 'identity', 'chat'];
  console.info(`\n\n${message} dns records at ${domainName}`);
  await dns(neostradaApiKey, domainName, assignedRecords, enable);

  console.info(`\n\n${message} port forwarding rules`);
  const zyxelCredentials = getEnvVar('ZYXEL_CREDENTIALS');
  await portForwarding(zyxelCredentials, [
    80, // HTTP
    443, // HTTPS
  ], enable);
})();
