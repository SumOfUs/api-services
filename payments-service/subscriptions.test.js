// @flow weak
import { cancelSubscription, handler } from './subscriptions-delete';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { client } from '../lib/clients/braintree/braintree';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

jest
  .spyOn(DocumentClient.prototype, 'put')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));
jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));
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

      test('writes to the operations log table', () => {
        return handler(event, null, cb).then(resp => {
          expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
            event: 'DELETE',
            data: { recurringId: '73zstm', paymentProcessor: 'braintree' },
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
          });
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

      test('writes to the operations log table', () => {
        return handler(event, null, cb).then(resp => {
          expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
            event: 'DELETE',
            data: {
              recurringId: 'SB0000BPD0CBDC',
              paymentProcessor: 'gocardless',
            },
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
          });
        });
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
