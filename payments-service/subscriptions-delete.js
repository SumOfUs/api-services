import { post } from 'axios';
import { response, ok, badRequest } from '../lib/lambda-utils/responses';
import { deleteSubscription as cancelGCSubscription } from '../lib/clients/gocardless/gocardless';
import { OperationsLogger } from '../lib/dynamodb/operationsLogger';
import { cancelSubscription as cancelBtSubscription } from '../lib/clients/braintree/braintree';

const logger = new OperationsLogger({
  namespace: 'PAYMENT_SERVICE:SUBSCRIPTION',
  tableName: process.env.DB_LOG_TABLE,
});

export const cancelSubscription = (id, provider) => {
  if (provider === 'braintree') {
    return cancelBtSubscription(id);
  } else {
    return cancelGCSubscription(id);
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
      return callback(null, response({ cors: true, body: event.data }));
    })
    .catch(err => {
      return callback(null, badRequest({ cors: true, body: err }));
    });
};
