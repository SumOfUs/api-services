import axios from 'axios';
import AWS from 'aws-sdk';
// import updateOperationsLog from './updateOperationsLog';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';

import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import { cancelRecurringDonation } from '../lib/clients/champaign/recurring_donation';

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
          console.log('Champaign success, log success');
          return callback(
            null,
            `Subscription ${record.data.recurringId} cancelled successfully`
          );
        })
        .catch(dynamodbError => {
          console.log('Champaign success, log error: ', dynamodbError);
          // call back with error from dynamodb
          return callback(dynamodbError);
        });
    })
    .catch(champaignError => {
      console.log('Champaign error: ', champaignError);
      logger
        .updateStatus(record, { champaign: 'FAILURE' })
        .then(dynamodbSuccess => {
          console.log('Champaign error, log success ', champaignError);
          // call back with error from champaign
          return callback(champaignError);
        })
        .catch(dynamodbError => {
          console.log('Champaign error, log error: ', dynamodbError);
          // call back with error from dynamodb
          return callback(dynamodbError);
        });
    });
};
