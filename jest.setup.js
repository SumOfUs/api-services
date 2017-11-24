import path from 'path';
import replayer from 'replayer';

var sensitiveVars = [
  'AK_API_URL',
  'AK_PASSWORD',
  'AK_USERNAME',
  'BRAINTREE_ENV',
  'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_PRIVATE_KEY',
  'BRAINTREE_PUBLIC_KEY',
  'GOCARDLESS_TOKEN',
];

sensitiveVars.forEach(variable => {
  replayer.substitute(`<${variable}>`, function() {
    return process.env[variable];
  });
});

replayer.fixtureDir(path.join(process.cwd(), 'replayer-fixtures'));
