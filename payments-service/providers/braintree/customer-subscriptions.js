// @flow weak
import { validateRequest } from '../../../shared/request-validator';
import { ok, badRequest } from '../../../shared/lambda-utils/responses';
import { subscriptions } from '../../../shared/braintree';

const showSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

export function handler(event, context, callback) {
  return validateRequest(showSchema, event.pathParameters).then(
    params => {
      subscriptions(params.email).then(subscriptions => {
        callback(null, ok({ body: { subscriptions } }));
      });
    },
    errors => {
      callback(null, badRequest({ cors: true, body: errors }));
    }
  );
}
