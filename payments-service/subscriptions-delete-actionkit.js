// @flow weak
import AWS from 'aws-sdk';
import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import { cancel as cancelRecurringOrder } from '../lib/clients/actionkit';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

const logger = new OperationsLogger({
  client: new AWS.DynamoDB.DocumentClient(),
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE || 'OperationsTable',
});

export const handler = async (e, ctx, cb, cancel = cancelRecurringOrder) => {
  // Get first item
  const [item] = e.Records;
  const record = AWS.DynamoDB.Converter.unmarshall(item.dynamodb.NewImage);
  if (!cancelPaymentEvent(record)) return cb(null, 'Not a cancel event');

  try {
    await cancel(record.data.recurringId);
    logger.updateStatus(record, { actionkit: 'SUCCESS' });
  } catch (error) {
    logger.updateStatus(record, { actionkit: 'FAILURE' });
    return cb(error);
  }

  return cb(
    null,
    `Subscription ${record.data.recurringId} cancelled successfully`
  );
};
