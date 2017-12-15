import { searchGCSubscriptions } from './gocardless';
import { getGCOrderRecurrings } from '../clients/actionkit/resources/orderrecurring';

describe('searchGCSubscriptions', () => {
  test(
    'returns an array of GC subscriptions',
    done => {
      searchGCSubscriptions('12358102').then(subscriptions => {
        expect(subscriptions.length).toEqual(1);
        expect(subscriptions).toContainEqual({
          provider: 'gocardless',
          createdAt: '2016-05-10T08:48:53.950Z',
          startDate: '2016-05-13',
          id: 'SB00002WF7DNMC',
          amount: 11.55,
          currency: 'GBP',
          status: 'active',
        });
        done();
      });
    },
    20000
  );

  test(
    'returns an empty array if the member has no GC subscriptions',
    done => {
      searchGCSubscriptions('4666356').then(subscriptions => {
        expect(subscriptions.length).toEqual(0);
        done();
      });
    },
    20000
  );
});
