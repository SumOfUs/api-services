// @flow weak
import { IAKClient as AKClient } from './client';
import { pick as _pick, filter as _filter } from 'lodash';

export const getOrderRecurrings = userId => {
  return AKClient.get('/orderrecurring/', { params: { user: userId } }).then(
    data => {
      return data.objects.map(buildOrder);
    }
  );
};

export const getGCOrderRecurrings = userId => {
  return getOrderRecurrings(userId).then(orders => {
    return _filter(orders, o => {
      return o.provider === 'gocardless';
    });
  });
};

const buildOrder = akOrder => {
  let provider;
  if (akOrder.account.match(/gocardless/i)) provider = 'gocardless';
  else if (akOrder.account.match(/braintree/i)) provider = 'braintree';
  else if (akOrder.account.match(/paypal/i)) provider = 'braintree';

  return {
    provider,
    recurringId: akOrder.recurring_id,
    ..._pick(akOrder, 'amount', 'currency', 'status'),
  };
};
