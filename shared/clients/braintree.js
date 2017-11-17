const braintree = require('braintree');

export default braintree.connect({
  environment: braintree.Environment[process.env.BRAINTREE_ENV],
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
