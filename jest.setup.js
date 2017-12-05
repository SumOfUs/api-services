import path from 'path';
import replayer from 'replayer';
import { escape } from 'querystring';

const sensitiveKeys = [
  'AK_USERNAME',
  'AK_PASSWORD',
  'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_PRIVATE_KEY',
  'BRAINTREE_PUBLIC_KEY',
  'GOCARDLESS_TOKEN',
];

sensitiveKeys.forEach(key => {
  replayer.substitute(`<${key}>`, () => process.env[key]);
  // Also substitute the escaped versions (when used in URLs)
  replayer.substitute(`<${key}_ESCAPED>`, () => escape(process.env[key]));
});

// Special case: substitute braintree auth token (base64 encoded)
replayer.substitute(`<BRAINTRE_BASIC_AUTH_TOKEN>`, () => {
  const { BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } = process.env;
  return new Buffer(
    `${BRAINTREE_PUBLIC_KEY}:${BRAINTREE_PRIVATE_KEY}`
  ).toString('base64');
});

replayer.fixtureDir(path.join(process.cwd(), 'replayer-fixtures'));

replayer.configure({});
jest.setTimeout(20000);
