import { handlerFunc as handler } from './champaignSubjectAccessData';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import uuidv1 from 'uuid/v1';
import { SUBJECT_ACCESS_REQUEST_EVENT } from '../lib/dynamodb/eventTypeChecker';

jest.spyOn(OperationsLogger.prototype, 'log');
const updateSpy = jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

describe('Champaign subject access data handler', function() {
  const cb = jest.fn();

  test('returns if the event is not a subject access event', function() {
    const event = invalidEvent(new Date().toISOString());
    handler(event, null, cb);
    expect(cb).toHaveBeenCalledWith(
      null,
      'Not a subject access request event.'
    );
  });

  // test - gets data from Champaign
  // test - uploads a zip file to s3
  // test - emails member services
  // test - updates operations log table on success
  // test - updates operations log table on failure
  test('on success, updates the operations log status', function() {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    handler(event, null, jest.fn())
      .then(function(res) {
        expect(updateSpy).toHaveBeenCalledWith(record, {
          champaign: 'SUCCESS',
        });
        expect(cb).toHaveBeenCalledWith(
          null,
          'Subject Access Data for champaign successfully sent for tuuli@sumofus.org'
        );
      })
      .catch(function(err) {
        console.log('ERR: ', err);
      });
  });

  //test(`[on champaign success] updates the operation log status with 'success' (replayer)`, async () => {
  //  const event = validEvent(new Date().toISOString());
  //  const record = unmarshall(event.Records[0].dynamodb.NewImage);
  //  await handler(event, null, jest.fn(), () => Promise.resolve());
  //  expect(statusSpy).toBeCalledWith(record, { champaign: 'SUCCESS' });
  //  expect(cb).toHaveBeenCalledWith(
  //    null,
  //    'Subscription c8rqgb cancelled successfully'
  //  );
  //});
  //
  //test(`[on champaign failure] updates the operation log status with 'failure' (replayer)`, async () => {
  //  const event = notFoundEvent(new Date().toISOString());
  //  const record = unmarshall(event.Records[0].dynamodb.NewImage);
  //  // const cancelFn = jest.fn(() => Promise.reject());
  //  await handler(event, null, cb);
  //  expect(statusSpy).toBeCalledWith(record, { champaign: 'FAILURE' });
  //  expect(cb).toHaveBeenCalledWith({
  //    errors: ['Recurring donation IdontExist for braintree not found.'],
  //  });
  //});
});

function validEvent(date) {
  return {
    Records: [
      {
        eventName: 'INSERT',
        dynamodb: {
          NewImage: marshall({
            eventType: SUBJECT_ACCESS_REQUEST_EVENT,
            id: uuidv1(),
            createdAt: date,
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
            data: {
              email: 'tuuli@sumofus.org',
            },
          }),
        },
      },
    ],
  };
}

function memberNotFoundEvent(date) {
  return {
    Records: [
      {
        eventName: 'INSERT',
        dynamodb: {
          NewImage: marshall({
            eventType: SUBJECT_ACCESS_REQUEST_EVENT,
            id: uuidv1(),
            createdAt: date,
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
            data: {
              email: 'oemgeerrrd@example.com',
            },
          }),
        },
      },
    ],
  };
}

function invalidEvent() {
  return {
    Records: [
      { dynamodb: { NewImage: { eventName: 'INSERT', eventType: 'INVALID' } } },
    ],
  };
}
