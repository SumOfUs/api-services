import { getOrderRecurrings } from '../orderrecurring';

describe('getOrderRecurings', () => {
  test('returns an array of orders', done => {
    getOrderRecurrings('11727499').then(orders => {
      expect(orders).toEqual(expect.any(Array));
      const order = orders[0];
      expect(order.provider).toEqual('braintree');
      expect(order.amount).toEqual('5.00');
      expect(order.currency).toEqual('USD');
      expect(order.recurringId).toEqual('j86czg');
      expect(order.status).toEqual('canceled_by_user');
      done();
    });
  });

  test('returns an empty array if the member has no orders', done => {
    getOrderRecurrings('3745651').then(orders => {
      expect(orders).toEqual([]);
      done();
    });
  });

  test("returns an empty array if the member doesn't exist", done => {
    getOrderRecurrings('99999999999999').then(orders => {
      expect(orders).toEqual([]);
      done();
    });
  });
});
