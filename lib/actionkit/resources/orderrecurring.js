import { IAKClient as AKClient } from './client';
import { pick as _pick } from 'lodash';

export const getOrderRecurrings = userId => {
  return AKClient.get('/orderrecurring', { params: { user: userId } }).then(
    data => {
      return data.objects.map(buildOrder);
    }
  );
};

const buildOrder = akOrder => {
  let provider;
  if (akOrder.account.match(/gocardless/i)) provider = 'gocardless';
  else if (akOrder.account.match(/braintree/i)) provider = 'braintree';

  return {
    provider,
    recurringId: akOrder.recurring_id,
    ..._pick(akOrder, 'amount', 'currency', 'status'),
  };
};
