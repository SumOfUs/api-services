import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

export function validateRequest(schema, event) {
  const params = event.queryStringParameters || {};
  return new Promise((resolve, reject) => {
    console.log('validating...');
    if (ajv.validate(schema, params)) return resolve(params);
    console.log('rejecting...');
    console.log({
      statusCode: 400,
      body: JSON.stringify(ajv.errors, null, 2),
    });
    return reject({
      statusCode: 400,
      body: JSON.stringify(ajv.errors, null, 2),
    });
  });
}
