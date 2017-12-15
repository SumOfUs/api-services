import AWS from 'aws-sdk';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { handler } from './subscriptions-delete-actionkit';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { CANCEL_PAYMENT_EVENT } from '../lib/dynamodb/eventTypeChecker';
import uuidv1 from 'uuid/v1';

jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'update');
jest.spyOn(OperationsLogger.prototype, 'updateStatus');

const validEvent = {
  Records: [
    {
      dynamodb: {
        NewImage: marshall({
          eventName: 'INSERT',
          eventType: CANCEL_PAYMENT_EVENT,
          id: uuidv1(),
          createdAt: new Date().toISOString(),
          status: { actionkit: 'PENDING', champaign: 'PENDING' },
          data: {
            recurringId: 'testRecurringId',
          },
        }),
      },
    },
  ],
};

describe('subscriptions-delete-actionkit handler', function() {
  test('basically, it is a function', () => {
    expect(typeof handler).toEqual('function');
  });

  test('returns if the event is not a cancel payment event', () => {
    const event = {
      Records: [
        { dynamodb: { NewImage: { eventName: 'INSERT', eventType: 'TEST' } } },
      ],
    };
    const cb = jest.fn();
    handler(event, null, cb);
    expect(cb).toHaveBeenCalledWith(null, 'Not a cancel event');
  });

  test('attempts to cancel the record', () => {
    const record = unmarshall(validEvent.Records[0].dynamodb.NewImage);
    const cb = jest.fn();
    const cancelFn = jest.fn(() => Promise.resolve());
    handler(validEvent, null, cb, cancelFn);
    expect(cancelFn).toHaveBeenCalledWith(record.data.recurringId);
  });

  test('on AK success, updates the operation log with success', () => {
    const record = unmarshall(validEvent.Records[0].dynamodb.NewImage);
    const cb = jest.fn();
    const cancelFn = jest.fn(() => Promise.resolve());
    handler(validEvent, null, cb, cancelFn);

    expect(OperationsLogger.prototype.updateStatus).toHaveBeenCalledWith(
      record,
      { actionkit: 'SUCCESS' }
    );
  });
});
