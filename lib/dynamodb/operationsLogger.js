// @flow weak
import uuidv4 from 'uuid/v4';
import AWS from 'aws-sdk';
import { reduce } from 'lodash';

interface Operation {
  id: string;
  createdAt: string;
  eventType: string;
  status?: any;
  data?: any;
}

type OperationsLoggerOptions = {
  client: typeof AWS.DynamoDB.DocumentClient,
  namespace: string,
  tableName: string,
};

export class OperationsLogger {
  namespace: string;
  tableName: string;
  client: typeof AWS.DynamoDB.DocumentClient;

  constructor(config: OperationsLoggerOptions) {
    this.namespace = config.namespace;
    this.tableName = config.tableName;
    this.client = config.client;
  }

  log(logData) {
    if (process.env.NODE_ENV === 'test') return Promise.resolve();
    return this.client
      .put(this.dynamodbPutParams(logData))
      .promise()
      .catch(error => console.log(error));
  }

  updateStatus(record, state) {
    return this.client
      .update(this.dynamodbUpdateStatusParams(record, state))
      .promise();
  }

  dynamodbUpdateStatusParams(record, status) {
    const keys = Object.keys(status);
    const namesReducer = (result, key) => ({
      ...result,
      [`#${key}`]: key,
    });
    const valuesReducer = (result, key) => ({
      ...result,
      [`:r${keys.indexOf(key)}`]: status[key],
    });

    const expressions = keys.map((key, i) => `#s#${key} = :r${i}`).join(', ');
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
  dynamodbPutParams(logData) {
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
