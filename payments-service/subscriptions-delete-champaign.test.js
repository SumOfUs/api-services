import { handler } from './subscriptions-delete-champaign';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { marshall, unmarshall } from 'aws-sdk/lib/dynamodb/converter';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { CANCEL_PAYMENT_EVENT } from '../lib/dynamodb/eventTypeChecker';
import uuidv1 from 'uuid/v1';

// spy (and mock) DynamoDB.DocumentClient
// This is to avoid making DynamoDB calls in testing
jest
  .spyOn(DocumentClient.prototype, 'put')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));
const updateSpy = jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

const statusSpy = jest.spyOn(OperationsLogger.prototype, 'updateStatus');

describe('subscriptions-delete-champaign handler', function() {
  const updateStatusSpy = OperationsLogger.prototype.updateStatus;
  const cb = jest.fn();

  test('basically, it is a function', () => {
    expect(typeof handler).toEqual('function');
  });

  test('returns if the event is not a cancel payment event', async () => {
    const event = invalidEvent(new Date().toISOString());
    await handler(event, null, cb);
    expect(cb).toHaveBeenCalledWith(null, 'Not a cancel event');
  });

  test('attempts to cancel the record', async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    const cancelFn = jest.fn(() => Promise.resolve());
    await handler(event, null, cb, cancelFn);
    expect(cancelFn).toHaveBeenCalledWith('testRecurringId', 'paymentprovider');
  });

  test(`[on champaign success] updates the operation log status with 'success'`, async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    await handler(event, null, jest.fn(), () => Promise.resolve());
    expect(statusSpy).toBeCalledWith(record, { champaign: 'SUCCESS' });
  });

  test(`[on champaign failure] updates the operation log status with 'failure'`, async () => {
    const event = validEvent(new Date().toISOString());
    const record = unmarshall(event.Records[0].dynamodb.NewImage);
    const cancelFn = jest.fn(() => Promise.reject());
    await handler(event, null, cb, cancelFn);
    expect(statusSpy).toBeCalledWith(record, { champaign: 'FAILURE' });
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
              paymentProcessor: 'paymentprovider',
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
