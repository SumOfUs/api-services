// @flow weak
import braintree from 'braintree';
import { pick, map } from 'lodash';

const CUSTOMER_FIELDS = ['firstName', 'lastName', 'email', 'createdAt'];
const CREDIT_CARD_FIELDS = [
  'cardType',
  'cardholderName',
  'last4',
  'expirationMonth',
  'expirationYear',
  'issuingBank',
];
const SUBSCRIPTION_FIELDS = [
  'balance',
  'billingPeriodEndDate',
  'billingPeriodStartDate',
  'createdAt',
  'currentBillingCycle',
  'daysPastDue',
  'description',
  'failureCount',
  'firstBillingDate',
  'id',
  'nextBillingDate',
  'nextBillingPeriodAmount',
  'numberOfBillingCycles',
];
const TRANSACTION_FIELDS = [
  'status',
  'currencyIsoCode',
  'amount',
  'createdAt',
  'id',
  'orderId',
  'refundIds',
  'refundedTransactionId',
];

// Object of format: { 'merchantId': 'Currency'}, ie { souUSD: 'USD' }
const merchantCurrencies = JSON.parse(
  process.env.BRAINTREE_MERCHANT_CURRENCIES || '{}'
);

export const client = braintree.connect({
  environment: braintree.Environment[process.env.BRAINTREE_ENV],
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export function cancelSubscription(id: string) {
  return client.subscription.cancel(id).then(resp => {
    return resp.success ? Promise.resolve(resp) : Promise.reject(resp);
  });
}

export function searchCustomer(email: string) {
  return new Promise((resolve, reject) => {
    const result = {
      customers: [],
      paymentMethods: [],
      subscriptions: [],
    };

    const stream = client.customer.search(search => {
      search.email().is(email);
    });

    stream.on('data', btCustomer => {
      result.customers.push(buildCustomer(btCustomer));
      btCustomer.paymentMethods.forEach(btPaymentMethod => {
        result.paymentMethods.push(buildPaymentMethod(btPaymentMethod));
        result.subscriptions = result.subscriptions.concat(
          map(btPaymentMethod.subscriptions, buildSubscription)
        );
      });
    });

    stream.on('end', response => {
      resolve(result);
    });

    stream.on('error', error => {
      reject(error);
    });
  });
}

const buildCustomer = btCustomer => {
  const customer = pick(btCustomer, CUSTOMER_FIELDS);
  return customer;
};

const buildPaymentMethod = btPaymentMethod => {
  let paymentMethod;

  if (btPaymentMethod instanceof braintree.CreditCard) {
    paymentMethod = {
      type: 'CreditCard',
      ...pick(btPaymentMethod, CREDIT_CARD_FIELDS),
    };
  } else if (btPaymentMethod instanceof braintree.PayPalAccount) {
    paymentMethod = {
      type: 'PayPalAccount',
      ...pick(btPaymentMethod, 'email'),
    };
  } else {
    console.log('WARN: Not supported Braintree Payment Method Type');
    paymentMethod = { type: 'Unknown' };
  }

  return paymentMethod;
};

const buildSubscription = btSubscription => {
  const subscription = pick(btSubscription, SUBSCRIPTION_FIELDS);
  subscription.amount = parseFloat(btSubscription.price);
  subscription.status = btSubscription.status.toLowerCase();
  subscription.currency =
    merchantCurrencies[btSubscription.merchantAccountId] || 'Unknown';

  subscription.statusHistory = map(btSubscription.statusHistory, status => {
    return pick(status, 'status', 'balance', 'price');
  });

  subscription.transactions = map(btSubscription.transactions, transaction => {
    return pick(transaction, TRANSACTION_FIELDS);
  });

  subscription.provider = 'braintree';
  return subscription;
};
