// @flow weak
import braintree from 'braintree';
import { pick, map, uniq } from 'lodash';

function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('data', data => result.push(data));
    stream.on('end', () => resolve(result));
    stream.on('error', error => reject(error));
  });
}

export const gateway = braintree.connect({
  environment: braintree.Environment[process.env.BRAINTREE_ENV],
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const { subscription, transaction } = gateway;

export function transactions(email: string, extra) {
  return streamToPromise(
    gateway.transaction.search(search => {
      search.customerEmail().is(email);
      if (extra) extra(search);
    })
  );
  // if you want to transform the result, add a .then() to the return:
  //  return streamToPromise(
  //    ...
  //  ).then(transformFn)
}

export function subscriptions(email: string) {
  return transactions(email, search =>
    search.source().is(braintree.Transaction.Source.Recurring)
  ).then(transactions => {
    const ids = uniq(map(transactions, t => t.subscriptionId));
    return streamToPromise(subscription.search(search => search.ids().in(ids)));
  });
}

export const customer = (email: string) =>
  streamToPromise(gateway.customer.search(search => search.email().is(email)));
