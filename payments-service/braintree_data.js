import { validateRequest } from '../shared/request-validator';
import { ok, badRequest } from '../shared/lambda-utils/responses';

const showSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
    },
  },
};

export const show = (event, context, callback) => {
  return validateRequest(showSchema, event.queryStringParameters).then(
    () => {
      callback(null, ok({ body: { message: 'Yay', event } }));
    },
    errors => {
      callback(null, badRequest({ cors: true, body: errors }));
    }
  );
};
