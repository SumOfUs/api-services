jest.mock('../lib/util/processSubjectAccessRequest');
jest.mock('../lib/clients/actionkit/resources/akSubjectAccessData');
jest.mock(
  '../lib/clients/actionkit/resources/subjectAccessQueries/subjectAccessQueries'
);

import { handlerFunc as handler } from './akSubjectAccessData';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import uuidv1 from 'uuid/v1';
import { SUBJECT_ACCESS_REQUEST_EVENT } from '../lib/dynamodb/eventTypeChecker';
import { processSubjectAccessRequest } from '../lib/util/processSubjectAccessRequest';
import { AKSubjectAccessData } from '../lib/clients/actionkit/resources/akSubjectAccessData';

jest.spyOn(OperationsLogger.prototype, 'log');
const statusSpy = jest.spyOn(OperationsLogger.prototype, 'updateStatus');
const updateSpy = jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

describe('actionkit subject access data handler', function() {
  const cb = jest.fn();
  const AKMockData = {
    actions: [
      { page_id: 213, member_id: 123 },
      { page_id: 234, member_id: 435 },
    ],
  };

  test('returns if the event is not a subject access event', function() {
    const event = invalidEvent(new Date().toISOString());
    handler(event, null, cb, AKSubjectAccessData);
    expect(cb).toHaveBeenCalledWith(
      null,
      'Not a pending subject access request event.'
    );
  });

  test(`[on success], updates the operations log status with 'SUCCESS' (replayer)`, function() {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    handler(event, null, cb, AKSubjectAccessData).then(function(res) {
      expect(processSubjectAccessRequest).toHaveBeenCalledWith(
        AKMockData,
        'actionkit',
        record.data.email
      );
      expect(statusSpy).toHaveBeenCalledWith(record, {
        actionkit: 'SUCCESS',
      });
      expect(cb).toHaveBeenCalledWith(
        null,
        'Subject Access Data for actionkit successfully sent for tuuli@sumofus.org'
      );
    });
  });

  test(`[on failure], updates the operations log status with 'FAILURE' (replayer)`, function() {
    const event = memberNotFoundEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);

    handler(event, null, cb, () =>
      Promise.reject('oh no member not found')
    ).then(function(_) {
      expect(statusSpy).toHaveBeenCalledWith(record, {
        actionkit: 'FAILURE',
      });
      expect(cb).toHaveBeenCalledWith('oh no member not found');
    });
  });
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
