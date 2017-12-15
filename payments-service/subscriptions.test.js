// @flow weak

import { cancelSubscription, handler } from './subscriptions-delete';
import { client } from '../lib/clients/braintree/braintree';

describe('handler', () => {
  describe('Cancelling a Braintree subscription', () => {
    const cb = jest.fn(function(err, response) {
      return response;
    });

    describe('Success', () => {
      const event = {
        pathParameters: {
          id: '73zstm',
          provider: 'braintree',
        },
      };

      test('passes the right parameters to cancelSubscription', () => {
        const fn = jest.fn((...params) => Promise.resolve(params));
        handler(event, null, cb, fn);
        expect(fn).toBeCalledWith('73zstm', 'braintree');
      });

      test('responds on success (replayer)', () => {
        return expect(handler(event, null, cb)).resolves.toEqual(
          expect.objectContaining({ statusCode: 200, body: '' })
        );
      });
    });

    describe('Failure', () => {
      const event = {
        pathParameters: {
          id: 'bz6vvr',
          provider: 'braintree',
        },
      };

      test('responds on errors / exceptions (replayer)', () => {
        return expect(handler(event, null, cb)).resolves.toEqual(
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

  describe('Cancelling a GoCardless subscription', () => {
    const cb = jest.fn(function(err, response) {
      return response;
    });

    describe('Success', () => {
      const event = {
        pathParameters: {
          id: 'SB0000BPD0CBDC',
          provider: 'gocardless',
        },
      };

      test('passes the right parameters to cancelSubscription', () => {
        const fn = jest.fn((...params) => Promise.resolve(params));
        handler(event, null, cb, fn);
        expect(fn).toBeCalledWith('SB0000BPD0CBDC', 'gocardless');
      });

      test('responds on success (replayer)', () => {
        return expect(handler(event, null, cb)).resolves.toEqual(
          expect.objectContaining({ statusCode: 200, body: '' })
        );
      });
    });

    describe('Failure', () => {
      const event = {
        pathParameters: {
          id: '',
          provider: 'gocardless',
        },
      };

      test('responds on errors / exceptions (replayer)', () => {
        return expect(handler(event, null, cb)).resolves.toEqual(
          expect.objectContaining({
            statusCode: 400,
            body: expect.stringContaining('not found'),
          })
        );
      });
    });
  });
});
