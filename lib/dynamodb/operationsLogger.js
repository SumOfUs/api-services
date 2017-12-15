// @flow weak
import uuidv4 from 'uuid/v4';
import AWS from 'aws-sdk';

interface Operation {
  id: string;
  createdAt: string;
  eventType: string;
  status?: any;
  data?: any;
}

type OperationsLoggerOptions = {
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
    this.client = new AWS.DynamoDB.DocumentClient();
  }

  log(logData) {
    console.log('I AM TOTALLY LOGGING NOW', logData);
    if (process.env.NODE_ENV === 'test') return Promise.resolve();
    return this.client
      .put(this.dynamodbPutParams(logData))
      .promise()
      .catch(error => console.log(error));
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
