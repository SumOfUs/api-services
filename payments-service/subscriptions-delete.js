import { post } from 'axios';
import { response, ok, badRequest } from '../lib/lambda-utils/responses';
import { client as braintree } from '../lib/clients/braintree';
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

export const gocardless = id => {
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

function btResponseToPromise(btResponse) {
  if (btResponse.success) return Promise.resolve(btResponse);
  return Promise.reject(btResponse);
}

export const cancelSubscription = (id, provider) => {
  if (provider === 'braintree') {
    return btResponseToPromise(braintree.subscription.cancel(id));
  } else {
    return gocardless(id);
  }
};

export const handler = (event, context, callback, fn = cancelSubscription) => {
  const { id, provider } = event.pathParameters;

  return fn(id, provider)
    .then(resp => {
      console.log('resp:', JSON.stringify(resp, null, 2));
      //logOperation(id, provider);
      return callback(null, response({ cors: true, body: event.data }));
    })
    .catch(err => {
      console.log('err:', JSON.stringify(err, null, 2));
      return callback(null, badRequest({ cors: true, body: err }));
    });
};
