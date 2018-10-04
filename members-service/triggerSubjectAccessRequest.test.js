import { handlerFunc as handler } from './triggerSubjectAccessRequest';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

jest.spyOn(OperationsLogger.prototype, 'log');

describe('triggerSubjectAccessRequest handler', function() {
  describe('failure', function() {
    const cb = jest.fn();

    test('if email param is blank it returns 400 bad request', () => {
      const params = {
        pathParameters: 'abc',
      };

      handler(params, null, cb)
        .then(() => {
          expect(cb).toBeCalledWith(
            null,
            expect.objectContaining({
              statusCode: 400,
              body: expect.stringMatching(
                /should have required property 'email'/
              ),
            })
          );
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('success', function() {
    const cb = jest.fn(function(err, response) {
      return response;
    });
    const event = {
      pathParameters: {
        email: 'foo@sumofus.org',
      },
    };

    test('it writes to the operations log table', () => {
      return handler(event, null, cb).then(resp => {
        expect(OperationsLogger.prototype.log).toHaveBeenCalledWith({
          event: 'MEMBER:SUBJECT_ACCESS_REQUEST',
          data: { email: 'foo@sumofus.org' },
          status: { actionkit: 'PENDING', champaign: 'PENDING' },
        });
      });
    });
  });
});
