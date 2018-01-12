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
        const event = {
          body: '{"email":"tuuli@sumofus.org", "lang":"/v1/rest/lang/101/"}',
        };
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
        const event = {
          body: '{"email":"tuuli@sumofus.org", "lang":"/foo/101/"}',
        };
        return unsubscribe(event, null, cb).then(resp => {
          expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
            event: 'EMAIL_UNSUBSCRIBE',
            data: { email: 'tuuli@sumofus.org' },
          });
        });
      });
    });

    describe('failure', () => {
      describe('Invalid requests', () => {
        test('Invalid when email is undefined', () => {
          const event = { body: '{"lang":"/foo/101/"}' };
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
          const event = { body: '{"email":"asd", "lang":"/foo/101/"}' };
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
