// @flow weak
import { searchCustomer } from '../braintree';
require('replayer');

describe('searchCustomer', () => {
  test('given the user exists returns a customer object', done => {
    searchCustomer('test@sou.com').then(result => {
      let { customers, paymentMethods, subscriptions } = result;
      const customer = customers[0];
      // Includes customer's basic info
      expect(customer).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@sou.com',
        createdAt: '2017-11-23T21:57:17Z',
      });

      // Includes payment method of type CreditCard
      expect(paymentMethods).toContainEqual({
        type: 'CreditCard',
        cardType: 'Visa',
        cardholderName: null,
        last4: '1111',
        expirationMonth: '12',
        expirationYear: '2017',
        issuingBank: 'Unknown',
      });

      // Includes payment method of type PayPalAccount
      expect(paymentMethods).toContainEqual({
        type: 'PayPalAccount',
        email: 'payer@example.com',
      });

      // Includes the subscriptions for a payment method
      expect(subscriptions).toEqual([
        {
          provider: 'braintree',
          balance: '0.00',
          billingPeriodEndDate: '2017-12-22',
          billingPeriodStartDate: '2017-11-23',
          createdAt: '2017-11-23T21:57:19Z',
          currentBillingCycle: 1,
          daysPastDue: null,
          description: null,
          failureCount: 0,
          firstBillingDate: '2017-11-23',
          id: 'j4ym6w',
          merchantAccountId: 'USD',
          nextBillingDate: '2017-12-23',
          nextBillingPeriodAmount: '1.00',
          numberOfBillingCycles: null,
          price: '1.00',
          status: 'Active',
          statusHistory: expect.any(Array),
          transactions: expect.any(Array),
        },
      ]);

      // Includes the transactions for a subscription
      expect(subscriptions[0].transactions).toEqual([
        {
          status: 'settled',
          currencyIsoCode: 'USD',
          amount: '1.00',
          createdAt: '2017-11-23T21:57:18Z',
          id: 'pcww0nx2',
          orderId: null,
          refundIds: [],
          refundedTransactionId: null,
        },
      ]);

      done();
    });
  });

  test("given the user doesn't exist returns an empty array", done => {
    searchCustomer('inexistent@sou.com').then(result => {
      let { customers, paymentMethods, subscriptions } = result;
      expect(customers).toEqual([]);
      expect(paymentMethods).toEqual([]);
      expect(subscriptions).toEqual([]);
      done();
    });
  });
});
