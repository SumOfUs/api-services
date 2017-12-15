// @flow weak

import { cancelSubscription, handler } from './subscriptions-delete';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { client } from '../lib/clients/braintree/braintree';

jest.spyOn(OperationsLogger.prototype, 'log');

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

      test.only('writes to the operations log table', () => {
        handler(event, null, cb);
        console.log(
          'operations logger prototype log ',
          OperationsLogger.prototype.log
        );
        expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
          event: 'DELETE',
          data: { recurringId: '73zstm', paymentProcessor: 'braintree' },
          status: { actionkit: 'PENDING', champaign: 'PENDING' },
        });
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

      // test('writes to the operations log table', () => {
      //   expect(operationsLogger).toBeCalledWith({
      //     event: 'DELETE',
      //     data: { recurringId: 'SB0000BPD0CBDC', paymentProcessor: 'gocardless' },
      //     status: { actionkit: 'PENDING', champaign: 'PENDING' },
      //   });
      //   handler(event, null, cb);
      // });
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
