import { ok, badRequest } from '../shared/lambda-utils/responses';
import braintree from '../shared/clients/braintree';
import guid from 'guid';
import AWS from 'aws-sdk';

const documentClient = new AWS.DynamoDB.DocumentClient();

const logOperation = id => {
  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Item: {
      id: guid.raw(),
      createdAt: new Date().toISOString(),
      eventType: 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL',
      data: {
        recurringId: id,
        paymentProcessor: 'braintree',
      },
      status: {
        actionkit: 'PENDING',
        champaign: 'PENDING',
      },
    },
  };

  documentClient
    .put(params)
    .promise()
    .then(resp => console.log('TABLE PUT RESPONSE:', resp))
    .catch(err => console.log('TABLE PUT ERROR', err));
};

export const handler = (event, context, callback) => {
  const id = event.pathParameters.id;

  braintree.subscription
    .cancel(id)
    .then(() => {
      logOperation(id);
      callback(null, ok());
    })
    .catch(err => {
      console.log('BRAINTREE SUBSCRIPTION CANCEL ERROR:', err);
      callback(null, badRequest());
    });
};
