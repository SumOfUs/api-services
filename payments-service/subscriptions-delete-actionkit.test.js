import AWS from 'aws-sdk';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { handler } from './subscriptions-delete-actionkit';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { CANCEL_PAYMENT_EVENT } from '../lib/dynamodb/eventTypeChecker';
import uuidv1 from 'uuid/v1';

const updateSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'update');
const statusSpy = jest.spyOn(OperationsLogger.prototype, 'updateStatus');

describe('subscriptions-delete-actionkit handler', function() {
  const updateStatusSpy = OperationsLogger.prototype.updateStatus;
  test('basically, it is a function', () => {
    expect(typeof handler).toEqual('function');
  });

  test('returns if the event is not a cancel payment event', async () => {
    const event = invalidEvent(new Date().toISOString());
    const cb = jest.fn();
    await handler(event, null, cb);
    expect(cb).toHaveBeenCalledWith(null, 'Not a cancel event');
  });

  test('attempts to cancel the record', async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    const cb = jest.fn();
    const cancelFn = jest.fn(() => Promise.resolve());
    await handler(event, null, cb, cancelFn);
    expect(cancelFn).toHaveBeenCalledWith(record.data.recurringId);
  });

  test(`[on ak success] updates the operation log status with 'success'`, async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    await handler(event, null, jest.fn(), () => Promise.resolve());
    expect(statusSpy).toBeCalledWith(record, { actionkit: 'SUCCESS' });
  });

  test(`[on ak failure] updates the operation log status with 'failure'`, async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    await handler(event, null, jest.fn(), () => Promise.reject());
    expect(statusSpy).toBeCalledWith(record, { actionkit: 'FAILURE' });
  });
});

function validEvent(date) {
  return {
    Records: [
      {
        dynamodb: {
          NewImage: marshall({
            eventName: 'INSERT',
            eventType: CANCEL_PAYMENT_EVENT,
            id: uuidv1(),
            createdAt: date,
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
            data: {
              recurringId: 'testRecurringId',
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
