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
  client: typeof AWS.DynamoDB.DocumentClient;

  constructor(config: OperationsLoggerOptions) {
    this.namespace = config.namespace;
    this.client = new AWS.DynamoDB.DocumentClient({
      TableName: config.tableName,
    });
  }

  log(logData) {
    return this.client.put(this.dynamodbPutParams(logData)).promise();
  }

  dynamodbPutParams(logData) {
    const { id, event, status, data } = logData;
    return {
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
