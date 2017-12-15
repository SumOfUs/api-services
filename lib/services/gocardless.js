import { getGCOrderRecurrings } from '../clients/actionkit/resources/orderrecurring';
import { getSubscription } from '../clients/gocardless/gocardless';
import { filter } from 'lodash';

export const searchGCSubscriptions = memberId => {
  return getGCOrderRecurrings(memberId).then(orders => {
    const promises = orders.map(order => {
      return getSubscription(order.recurringId).catch(error => {
        if (error === 'NotFound') return Promise.resolve(null);
        else throw error;
      });
    });
    return Promise.all(promises).then(subscriptions => {
      return filter(subscriptions, s => {
        return s !== null;
      });
    });
  });
};
