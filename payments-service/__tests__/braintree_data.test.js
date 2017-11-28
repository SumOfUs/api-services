// @flow weak
import { show } from '../braintree_data';

describe('handler: braintree-data.show', () => {
  test('if email param is blank it returns 400 bad request', () => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
    };

    show(params, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 400,
          body: expect.stringMatching(/should have required property 'email'/),
        })
      );
    }, null);
  });

  test('if email param is present it returns 200 ok', () => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
      queryStringParameters: { email: 'bob@sou.com' },
    };

    const braintree = require('../../shared/clients/braintree');
    braintree.searchCustomer = jest.fn(email => {
      if (email == 'bob@sou.com') {
        return Promise.resolve({
          customers: [{ firstName: 'Bob' }],
          paymentMethods: [],
          subscriptions: [],
        });
      }
      return Promise.reject();
    });

    show(params, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: expect.stringMatching(/"firstName": "Bob"/),
        })
      );
    }, null);
  });
});
