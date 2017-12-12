// @flow weak
import { logOperation, gocardless, handler } from './subscriptions-delete';
import { client as braintree } from '../lib/clients/braintree';

describe('handler', () => {
  test.skip('successful request returns a 200', () => {
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
        id: 'f9pkvr',
        provider: 'braintree',
      },
    };

    const cb = jest.fn(function(err, response) {
      return response;
    });

    test('passes the right parameters to cancelSubscription', () => {
      const fn = jest.fn((...params) => Promise.resolve(params));
      handler(event, null, cb, fn);
      expect(fn).toBeCalledWith('f9pkvr', 'braintree');
    });

    test.only('responds on success', () => {
      const fn = jest.fn((...params) => Promise.resolve(params));
      return expect(handler(event, null, cb)).resolves.toEqual(
        expect.objectContaining({ statusCode: 200, body: '' })
      );
    });

    test('responds on errors / exceptions', () => {
      const fn = jest.fn((id, provider) => Promise.reject({ id, provider }));
      return expect(handler(event, null, cb, fn)).resolves.toEqual(
        expect.objectContaining({
          statusCode: 400,
          body: expect.stringContaining('f9pkvr'),
        })
      );
    });
  });
});
