import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

export function validateRequest(schema, params) {
  return new Promise((resolve, reject) => {
    if (ajv.validate(schema, params || {})) return resolve(params);
    return reject(ajv.errors);
  });
}
