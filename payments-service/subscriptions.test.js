// @flow weak
import { logOperation, gocardless, handler } from './subscriptions-delete';
import { client as braintree } from '../lib/clients/braintree';

describe('handler', () => {
  describe('Deleting a subscription', () => {
    const failure_event = {
      pathParameters: {
        id: 'bz6vvr',
        provider: 'braintree',
      },
    };

    const success_event = {
      pathParameters: {
        id: '73zstm',
        provider: 'braintree',
      },
    };

    const cb = jest.fn(function(err, response) {
      return response;
    });

    test('passes the right parameters to cancelSubscription', () => {
      const fn = jest.fn((...params) => Promise.resolve(params));
      handler(success_event, null, cb, fn);
      expect(fn).toBeCalledWith('73zstm', 'braintree');
    });

    test('responds on success (replayer)', () => {
      return expect(handler(success_event, null, cb)).resolves.toEqual(
        expect.objectContaining({ statusCode: 200, body: '' })
      );
    });

    test('responds on errors / exceptions (replayer)', () => {
      return expect(handler(failure_event, null, cb)).resolves.toEqual(
        expect.objectContaining({
          statusCode: 400,
          body: expect.stringContaining(
            'Subscription has already been canceled.'
          ),
        })
      );
    });
  });
});
