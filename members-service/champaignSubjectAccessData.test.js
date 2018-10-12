import { handlerFunc as handler } from './champaignSubjectAccessData';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import uuidv1 from 'uuid/v1';
import { SUBJECT_ACCESS_REQUEST_EVENT } from '../lib/dynamodb/eventTypeChecker';
jest.mock('../lib/util/processSubjectAccessRequest');
import { processSubjectAccessRequest } from '../lib/util/processSubjectAccessRequest';

jest.spyOn(OperationsLogger.prototype, 'log');
const statusSpy = jest.spyOn(OperationsLogger.prototype, 'updateStatus');
const updateSpy = jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

const champaignMockData = {
  data: { actions: [{ id: 213, member_id: 123 }, { id: 234, member_id: 435 }] },
};

describe('Champaign subject access data handler', function() {
  const cb = jest.fn();

  test('returns if the event is not a subject access event', function() {
    const event = invalidEvent(new Date().toISOString());
    handler(event, null, cb);
    expect(cb).toHaveBeenCalledWith(
      null,
      'Not a pending subject access request event.'
    );
  });

  test(`[on success], updates the operations log status with 'SUCCESS' (replayer)`, function() {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    processSubjectAccessRequest.mockImplementation((data, processor, email) =>
      Promise.resolve(
        `Subject Access Data for ${processor} successfully sent for ${email}`
      )
    );

    handler(event, null, cb, () => Promise.resolve(champaignMockData)).then(
      function(res) {
        expect(processSubjectAccessRequest).toHaveBeenCalledWith(
          champaignMockData.data,
          'champaign',
          record.data.email
        );
        expect(statusSpy).toHaveBeenCalledWith(record, {
          champaign: 'SUCCESS',
        });
        expect(cb).toHaveBeenCalledWith(
          null,
          'Subject Access Data for champaign successfully sent for tuuli@sumofus.org'
        );
      }
    );
  });

  test(`[on failure], updates the operations log status with 'FAILURE' (replayer)`, function() {
    const event = memberNotFoundEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);

    handler(event, null, cb, () =>
      Promise.reject('oh no member not found')
    ).then(function(res) {
      expect(statusSpy).toHaveBeenCalledWith(record, {
        champaign: 'FAILURE',
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
