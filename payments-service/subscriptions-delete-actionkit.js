// @flow weak
import AWS from 'aws-sdk';
import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import { cancel as cancelRecurringOrders } from '../lib/clients/actionkit/recurringOrders';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import log from '../lib/logger';

const logger = new OperationsLogger({
  client: new AWS.DynamoDB.DocumentClient(),
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE || 'OperationsTable',
});

export const handlerFunc = async (e, ctx, cb, fn = cancelRecurringOrders) => {
  // Get first item
  const [item] = e.Records;
  const record = AWS.DynamoDB.Converter.unmarshall(item.dynamodb.NewImage);
  if (!cancelPaymentEvent(item.eventName, record))
    return cb(null, 'Not a cancel event');

  try {
    await fn(record.data.recurringId);
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

export const handler = log(handlerFunc);
