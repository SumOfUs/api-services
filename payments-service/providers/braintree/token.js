import { client } from '../../../lib/clients/braintree';

const response = (code, body) => {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body || {}),
  };
};

export function handler(event, context, callback) {
  gateway.clientToken.generate({}, (err, braintree) => {
    if (err) {
      callback(null, response(500, { error: err.message }));
    } else {
      callback(null, response(200, { token: braintree.clientToken }));
    }
  });
}
