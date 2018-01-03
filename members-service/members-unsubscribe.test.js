// @flow
import { unsubscribe, unsubscribe_page } from './members';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

jest.spyOn(OperationsLogger.prototype, 'log');
jest
  .spyOn(DocumentClient.prototype, 'put')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

describe('members-unsubscribe', () => {
  const cb = jest.fn();

  describe('with a valid email address', () => {
    describe('success', () => {
      test('It sends an AK action to the unsubscribe page (replayer)', () => {
        const event = { body: '{"email":"tuuli@sumofus.org"}' };
        return unsubscribe(event, null, cb).then(() => {
          expect(cb).toBeCalledWith(
            null,
            expect.objectContaining({
              statusCode: 200,
              body: '',
            })
          );
        });
      });

      test('It writes to the operations log table', () => {
        const event = { body: '{"email":"tuuli@sumofus.org"}' };
        return unsubscribe(event, null, cb).then(resp => {
          expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
            event: 'EMAIL_UNSUBSCRIBE',
            data: { email: 'tuuli@sumofus.org' },
          });
        });
      });
    });

    describe('failure', () => {
      test('It fails if unsubscribe page check fails.', () => {
        const event = { body: '{"email":"tuuli@sumofus.org"}' };
        const pageCheck = jest.fn(() => {
          return Promise.reject(new Error('Unsubscribe page needs to be set.'));
        });
        return unsubscribe(event, null, cb, pageCheck).then(() => {
          expect(cb).toBeCalledWith(
            null,
            expect.objectContaining({
              statusCode: 400,
              body: expect.stringMatching('Unsubscribe page needs to be set.'),
            })
          );
        });
      });

      describe('Invalid requests', () => {
        test('Invalid when email is undefined', () => {
          const event = { body: '{}' };
          return unsubscribe(event, null, cb).then(() => {
            expect(cb).toBeCalledWith(
              null,
              expect.objectContaining({
                statusCode: 400,
                body: expect.stringMatching(/"missingProperty": "email"/),
              })
            );
          });
        });

        test('Invalid when email is not an email', () => {
          const event = { body: '{"email":"asd"}' };
          return unsubscribe(event, null, cb).then(() => {
            expect(cb).toBeCalledWith(
              null,
              expect.objectContaining({
                statusCode: 400,
                body: expect.stringMatching(/(properties\/email\/format)/),
              })
            );
            expect(cb).toBeCalledWith(
              null,
              expect.objectContaining({
                body: expect.stringMatching(/should match format/),
              })
            );
          });
        });
      });
    });
  });
});