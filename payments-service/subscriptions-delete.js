import { post } from 'axios';
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

const gocardless = id => {
  const url = `${process.env.GOCARDLESS_DOMAIN}/subscriptions/${
    id
  }/actions/cancel`;
  post(
    url,
    {},
    {
      headers: {
        Authorization: `Bearer ${process.env.GOCARDLESS_API_TOKEN}`,
        'GoCardless-Version': '2015-07-06',
      },
    }
  );
};

const subscription = (id, provider) => {
  if (provider === 'braintree') {
    return braintree.subscription.cancel(id);
  } else {
    return gocardless.subscription.cancel(id);
  }
};

export const handler = (event, context, callback) => {
  const { id, provider } = event.pathParameters;

  cancelSubscription(id, provider)
    .then(() => {
      logOperation(id, provider);
      callback(null, ok());
    })
    .catch(err => {
      console.log(`${provider} SUBSCRIPTION CANCEL ERROR:`, err);
      callback(null, badRequest());
    });
};
