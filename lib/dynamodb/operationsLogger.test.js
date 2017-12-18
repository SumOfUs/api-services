// @flow
import AWS from 'aws-sdk';
import uuidv1 from 'uuid/v1';
import { OperationsLogger } from './operationsLogger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// spy (and mock) DynamoDB.DocumentClient
// This is to avoid making DynamoDB calls in testing
jest
  .spyOn(DocumentClient.prototype, 'put')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));
jest
  .spyOn(DocumentClient.prototype, 'update')
  .mockImplementation(opts => ({ promise: () => Promise.resolve(opts) }));

jest.spyOn(OperationsLogger.prototype, 'dynamodbPutParams');
jest.spyOn(OperationsLogger.prototype, 'dynamodbUpdateStatusParams');

const { stringMatching, objectContaining } = expect;

const client = {
  put: jest.fn(() => client),
  update: jest.fn(() => client),
  promise: jest.fn(() => Promise.resolve('test')),
};

describe('OperationsLogger', () => {
  const logger = new OperationsLogger({
    tableName: 'TableName',
    namespace: 'Testing',
    client: client,
  });

  test('initialisation with correct parameters', () => {
    expect(logger).toBeInstanceOf(OperationsLogger);
  });

  describe('#log', () => {
    const logData = {
      status: { foo: 'foo', bar: 'bar' },
      data: { baz: 'baz' },
    };
    test('transforms `logData` into dynamodb put parameters', async () => {
      await logger.log(logData);
      expect(logger.dynamodbPutParams).toHaveBeenCalledWith(logData);
    });

    test('calls client.put and returns the promisified response', async () => {
      const result = await logger.log(logData);
      expect(client.put).toHaveBeenCalledWith(
        objectContaining({
          TableName: logger.tableName,
          Item: objectContaining({
            status: { bar: 'bar', foo: 'foo' },
          }),
        })
      );
      expect(client.promise).toHaveBeenCalled();
      expect(result).toEqual('test');
    });
  });

  describe('#updateStatus', () => {
    const record = {
      id: uuidv1(),
      createdAt: new Date().toISOString(),
    };

    const statusData = {
      foo: 'SUCCESS',
      bar: 'PENDING',
    };

    test('passes its params to generate dynamodb update params', async () => {
      await logger.updateStatus(record, statusData);
      expect(logger.dynamodbUpdateStatusParams).toHaveBeenCalledWith(
        record,
        statusData
      );
    });

    test('calls client.update and returns the promisified response', async () => {
      const result = await logger.updateStatus(record, statusData);
      expect(client.update).toHaveBeenCalledWith(
        objectContaining({
          Key: expect.anything(),
          UpdateExpression: expect.anything(),
          ExpressionAttributeNames: expect.anything(),
          ExpressionAttributeValues: expect.anything(),
        })
      );
      expect(client.promise).toHaveBeenCalled();
      expect(result).toEqual('test');
    });
  });

  describe('#dynamodbPutParams', () => {
    const data = {
      id: uuidv1(),
      event: 'SomeEventName',
      status: { foo: 'foo', bar: 'bar' },
      data: { baz: 'baz' },
    };

    test('creates the right shape for dynamodb.putItem', () => {
      const params = logger.dynamodbPutParams(data);
      expect(params).toEqual(
        objectContaining({
          TableName: logger.tableName,
          Item: objectContaining({
            id: data.id,
            createdAt: expect.any(String),
            eventType: `${logger.namespace}:${data.event}`,
            status: data.status,
            data: data.data,
          }),
        })
      );
    });
  });

  describe('#dynamodbUpdateStatusParams', () => {
    const record = {
      id: uuidv1(),
      createdAt: new Date().toISOString(),
    };

    const status = { goodAPI: 'SUCCESS', badAPI: 'FAILURE' };

    test('creates the right shape for dynamodb.putItem', () => {
      const params = logger.dynamodbUpdateStatusParams(record, status);
      expect(params).toEqual(
        objectContaining({
          TableName: logger.tableName,
          Key: objectContaining({
            id: record.id,
            createdAt: record.createdAt,
          }),
          UpdateExpression: stringMatching(/SET #s.#goodAPI = :r0.+/),
          ExpressionAttributeNames: objectContaining({
            '#s': 'status',
            '#goodAPI': 'goodAPI',
          }),
          ExpressionAttributeValues: objectContaining({
            ':r0': 'SUCCESS',
            ':r1': 'FAILURE',
          }),
        })
      );
    });

    test('generates an UpdateExpression with all substitutions', () => {
      const params = logger.dynamodbUpdateStatusParams(record, status);
      expect(params.UpdateExpression).toContain(
        'SET #s.#goodAPI = :r0, #s.#badAPI = :r1'
      );
    });

    test('generates ExpressionAttributeNames with all attributes', () => {
      const params = logger.dynamodbUpdateStatusParams(record, status);
      expect(params.ExpressionAttributeNames).toMatchObject({
        '#s': 'status', // status is always there
        '#goodAPI': 'goodAPI',
        '#badAPI': 'badAPI',
      });
    });

    test('generates ExpressionAttributeValues with all values and placeholders', () => {
      const params = logger.dynamodbUpdateStatusParams(record, status);
      expect(params.ExpressionAttributeValues).toMatchObject({
        ':r0': 'SUCCESS',
        ':r1': 'FAILURE',
      });
    });
  });
});
