import axios from 'axios';
import AWS from 'aws-sdk';
// import updateOperationsLog from './updateOperationsLog';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import { cancelRecurringDonation } from '../lib/clients/champaign/recurringDonation';

const logger = new OperationsLogger({
  client: new AWS.DynamoDB.DocumentClient(),
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE,
});

export const handler = (
  event,
  context,
  callback,
  cancelDonation = cancelRecurringDonation
) => {
  // Get first item
  const [item] = event.Records;
  const record = AWS.DynamoDB.Converter.unmarshall(item.dynamodb.NewImage);

  if (!cancelPaymentEvent(record)) {
    return callback(null, 'Not a cancel event');
  }
  const recurringId = record.data.recurringId;
  const provider = record.data.paymentProcessor;
  const id = record.id;
  const createdAt = record.createdAt;

  const data = JSON.stringify({
    id: recurringId,
    provider: provider,
  });

  return cancelDonation(recurringId, provider)
    .then(resp => {
      logger
        .updateStatus(record, { champaign: 'SUCCESS' })
        .then(dynamodbResponse => {
          return callback(
            null,
            `Subscription ${record.data.recurringId} cancelled successfully`
          );
        })
        .catch(dynamodbError => {
          // call back with error from dynamodb
          return callback(dynamodbError);
        });
    })
    .catch(champaignError => {
      logger
        .updateStatus(record, { champaign: 'FAILURE' })
        .then(dynamodbSuccess => {
          // call back with error from champaign
          return callback(champaignError.response.data);
        })
        .catch(dynamodbError => {
          // call back with error from dynamodb
          return callback(dynamodbError);
        });
    });
};
