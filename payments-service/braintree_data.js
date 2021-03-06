import { validateRequest } from '../lib/request-validator';
import { ok, badRequest } from '../lib/lambda-utils/responses';
import { searchCustomer } from '../lib/clients/braintree/braintree';
import log from '../lib/logger';

const showSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
    },
  },
};

export const showFunc = (event, context, callback) => {
  return validateRequest(showSchema, event.queryStringParameters).then(
    () => {
      return searchCustomer(event.queryStringParameters.email).then(
        data => callback(null, ok({ cors: true, body: data })),
        errors => {
          callback(null, badRequest({ cors: true, body: errors }));
        }
      );
    },
    errors => {
      return callback(null, badRequest({ cors: true, body: errors }));
    }
  );
};

export const show = log(showFunc);
