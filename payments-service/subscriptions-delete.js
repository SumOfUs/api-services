import { post } from 'axios';
import { response, ok, badRequest } from '../lib/lambda-utils/responses';
import { client as braintree } from '../lib/clients/braintree/braintree';
import { deleteSubscription as deleteGCSubscription } from '../lib/clients/gocardless/gocardless';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import uuid from 'uuid/v1';

const logger = new OperationsLogger({
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE,
});

function btResponseToPromise(btResponse) {
  if (btResponse.success) return Promise.resolve(btResponse);
  return Promise.reject(btResponse);
}

export function cancelSubscription(id, provider) {
  switch (provider) {
    case 'braintree':
      return btResponseToPromise(braintree.subscription.cancel(id));
    case 'gocardless':
      return deleteGCSubscription(id);
    default:
      return Promise.reject({ error: 'Unknown provider' });
  }
}

export const handler = (event, context, callback, fn = cancelSubscription) => {
  const { id, provider } = event.pathParameters;

  return fn(id, provider)
    .then(resp => {
      logger.log({
        event: 'DELETE',
        data: { recurringId: id, paymentProcessor: provider },
        status: { actionkit: 'PENDING', champaign: 'PENDING' },
      });
      return resp;
    })
    .then(resp => responseHandler(resp, provider))
    .then(resp => callback(null, response({ cors: true, body: event.data })))
    .catch(err => callback(null, badRequest({ cors: true, body: err })));
};

function responseHandler(provider, response) {
  switch (provider) {
    case 'braintree':
      const { success } = response;
      return success ? Promise.resolve(response) : Promise.reject(response);
    default:
      return response;
  }
}
