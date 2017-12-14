import { post } from 'axios';
import { response, ok, badRequest } from '../lib/lambda-utils/responses';
import { client as braintree } from '../lib/clients/braintree';
import { cancelSubscription as cancelBtSubscription } from '../lib/clients/braintree';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';

const documentClient = new AWS.DynamoDB.DocumentClient();

export const logOperation = (id, provider) => {
  const params = {
    TableName: process.env.DB_LOG_TABLE,
    Item: {
      id: uuid(),
      createdAt: new Date().toISOString(),
      eventType: 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL',
      data: {
        recurringId: id,
        paymentProcessor: provider,
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

export const cancelGCSubscription = id => {
  const url = `${process.env.GOCARDLESS_DOMAIN}/subscriptions/${
    id
  }/actions/cancel`;

  return post(
    url,
    {},
    {
      headers: {
        Authorization: `Bearer ${process.env.GOCARDLESS_TOKEN}`,
        'GoCardless-Version': '2015-07-06',
        Accept: 'application/json',
      },
    }
  );
};

export const cancelSubscription = (id, provider) => {
  if (provider === 'braintree') {
    return cancelBtSubscription(id);
  } else {
    return cancelGCSubscription(id);
  }
};

export const handler = (event, context, callback, fn = cancelSubscription) => {
  const { id, provider } = event.pathParameters;

  return fn(id, provider)
    .then(resp => {
      logOperation(id, provider);
      return callback(null, response({ cors: true, body: event.data }));
    })
    .catch(err => {
      return callback(null, badRequest({ cors: true, body: err }));
    });
};
