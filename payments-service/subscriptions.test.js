// @flow weak
// Mock our local braintree client in lib/clients/braintree
jest.mock('../lib/clients/braintree/braintree', () => ({
  client: { subscription: { cancel: jest.fn(() => ({ success: true })) } },
}));

import {
  cancelSubscription,
  logOperation,
  gocardless,
  handler,
} from './subscriptions-delete';
import { client } from '../lib/clients/braintree/braintree';

describe('handler', () => {
  test('successful request returns a 200', () => {
    const cb = jest.fn();
    const event = { pathParameters: { id: 'a1b2c3', provider: 'braintree' } };

    return handler(event, null, cb).then(() => {
      return expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: '',
        })
      );
    });
  });

  describe('Deleting a subscription', () => {
    const event = {
      pathParameters: {
        id: '83b3bw',
        provider: 'braintree',
      },
    };

    const cb = jest.fn(function(err, response) {
      return response;
    });

    test('passes the right parameters to cancelSubscription', () => {
      const fn = jest.fn((...params) => Promise.resolve(params));
      handler(event, null, cb, fn);
      expect(fn).toBeCalledWith('83b3bw', 'braintree');
    });

    test('responds on success (replayer)', () => {
      return expect(handler(event, null, cb)).resolves.toEqual(
        expect.objectContaining({ statusCode: 200, body: '' })
      );
    });

    test.only('responds on errors / exceptions (replayer)', () => {
      const event = { pathParameters: { id: 'f9pkvr', provider: 'braintree' } };
      return expect(handler(event, null, cb)).resolves.toEqual(
        expect.objectContaining({
          statusCode: 400,
          body: expect.stringContaining('f9pkvr'),
        })
      );
    });
  });
});

describe('cancelSubscription', function() {
  test('handles braintree subscriptions', () => {
    cancelSubscription('1234', 'braintree');
    expect(client.subscription.cancel).toHaveBeenCalledWith('1234');
  });
});
