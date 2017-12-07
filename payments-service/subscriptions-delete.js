import { post } from 'axios';
import { ok, badRequest } from '../lib/lambda-utils/responses';
import { client as braintree } from '../lib/clients/braintree';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';

const documentClient = new AWS.DynamoDB.DocumentClient();

const logOperation = (id, provider) => {
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

const gocardless = id => {
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

const cancelSubscription = (id, provider) => {
  if (provider === 'braintree') {
    return braintree.subscription.cancel(id);
  } else {
    return gocardless(id);
  }
};

export const handler = (event, context, callback) => {
  const { id, provider } = event.pathParameters;

  return cancelSubscription(id, provider)
    .then(resp => {
      logOperation(id, provider);
      callback(null, ok({ cors: true, body: event.data }));
    })
    .catch(err => {
      callback(null, badRequest({ cors: true, body: err }));
    });
};
