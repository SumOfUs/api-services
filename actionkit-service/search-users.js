import pick from 'lodash/pick';
import { get } from 'axios-es6';
import { validateRequest } from '../shared/request-validator';

export function searchUsers(filters) {
  return get(`${process.env.AK_API_URL}/user`, {
    auth: {
      username: process.env.AK_USERNAME,
      password: process.env.AK_PASSWORD,
    },
    params: { ...filters, limit: 1 },
  }).then(response => ({
    statusCode: response.status,
    headers: response.headers,
    body: JSON.stringify(response.data, null, 2),
  }));
}

const schema = {
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
  validateRequest(schema, event.queryStringParameters).then(
    params => {
      searchUsers(pick(params, 'email'))
        .then(result => callback(null, result))
        .catch(failure => callback(null, { statusCode: 400, body: failure }));
    },
    failure => callback(null, failure)
  );
}
