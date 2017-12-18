// @flow
import uuidv4 from 'uuid/v4';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { reduce } from 'lodash';

interface Operation {
  id: string;
  createdAt: string;
  eventType: string;
  status?: any;
  data?: any;
}

type OperationsLoggerOptions = {
  client: typeof DocumentClient,
  namespace: string,
  tableName: string,
};

type LogData = {
  event: string,
  id?: string,
  data?: any,
  status?: any,
};

export class OperationsLogger {
  namespace: string;
  tableName: string;
  client: typeof DocumentClient;

  constructor(config: OperationsLoggerOptions) {
    if (!config.client) {
      throw new Error(
        'OperationsLogger needs to be initialised with a client instance'
      );
    }
    this.namespace = config.namespace;
    this.tableName = config.tableName;
    this.client = config.client;
  }

  log(logData: LogData): Promise<*> {
    if (!logData.event) {
      throw new Error('OperationsLogger.log called without an event');
    }
    const params = this.dynamodbPutParams(logData);
    return this.client.put(params).promise();
  }

  updateStatus(record: any, state: any): Promise<*> {
    return this.client
      .update(this.dynamodbUpdateStatusParams(record, state))
      .promise();
  }

  dynamodbUpdateStatusParams(record: any, status: any) {
    const keys = Object.keys(status);
    const namesReducer = (result, key) => ({
      ...result,
      [`#${key}`]: key,
    });
    const valuesReducer = (result, key) => ({
      ...result,
      [`:r${keys.indexOf(key)}`]: status[key],
    });

    const expressions = keys.map((key, i) => `#s.#${key} = :r${i}`).join(', ');
    const names = { '#s': 'status', ...reduce(keys, namesReducer, {}) };
    const values = reduce(keys, valuesReducer, {});

    return {
      TableName: this.tableName,
      Key: {
        id: record.id,
        createdAt: record.createdAt,
      },
      UpdateExpression: `SET ${expressions}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    };
  }

  dynamodbPutParams(logData: LogData) {
    const { id, event, status, data } = logData;
    return {
      TableName: this.tableName,
      Item: {
        id: logData.id || uuidv4(),
        createdAt: new Date().toISOString(),
        eventType: `${this.namespace}:${logData.event}`,
        status: status,
        data: data,
      },
    };
  }
}
