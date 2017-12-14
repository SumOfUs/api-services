import { getSubscription } from './gocardless';

describe('getSubscription', () => {
  test('returns a subscription object', done => {
    getSubscription('SB00002WF7DNMC').then(subscription => {
      expect(subscription).toEqual({
        createdAt: '2016-05-10T08:48:53.950Z',
        startDate: '2016-05-13',
        id: 'SB00002WF7DNMC',
        amount: 11.55,
        currency: 'GBP',
        status: 'active',
        provider: 'gocardless',
      });
      done();
    });
  });

  test("rejects promise with NotFound code if subscription doesn't exist", done => {
    getSubscription('123').catch(error => {
      expect(error).toEqual('NotFound');
      done();
    });
  });
});
