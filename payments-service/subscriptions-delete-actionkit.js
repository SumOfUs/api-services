import AWS from 'aws-sdk';
import { post } from 'axios';
import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import { cancelRecurringOrder } from '../lib/clients/actionkit';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

const logger = new OperationsLogger({
  client: new AWS.DynamoDB.DocumentClient(),
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE,
});

export function handler(e, context, callback, cancel = cancelRecurringOrder) {
  // Get first item
  const [item] = e.Records;
  const record = AWS.DynamoDB.Converter.unmarshall(item.dynamodb.NewImage);
  if (!cancelPaymentEvent(record)) return callback(null, 'Not a cancel event');

  return cancel(record.data.recurringId)
    .then(resp => logger.updateStatus(record, { actionkit: 'SUCCESS' }))
    .catch(error => logger.updateStatus(record, { actionkit: 'FAILURE' }))
    .then(() => callback(undefined, 'done'), error => callback(error));
}
