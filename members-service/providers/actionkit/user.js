// @flow weak
import { get } from 'axios-es6';
import { pick } from 'lodash';

// Accessing process.env is expensive, therefore we make
// a local copy of what we need
const environment = pick(
  process.env,
  'AK_API_URL',
  'AK_PASSWORD',
  'AK_USERNAME'
);

export function searchUser(filters, env = environment) {
  if (!env.AK_API_URL) return Promise.reject('AK_API_URL is not set');
  if (!env.AK_USERNAME || !env.AK_PASSWORD) {
    return Promise.reject('ActionKit credentials are not set');
  }
  return get(`${env.AK_API_URL}/user`, {
    auth: {
      username: env.AK_USERNAME,
      password: env.AK_PASSWORD,
    },
    params: { ...filters, limit: 1 },
  })
    .then(result => {
      return result.data.objects;
    })
    .catch(error => {
      if (error.status) {
        return Promise.reject({
          statusCode: error.status,
          body: error.data || '',
        });
      }
      return Promise.reject(error);
    });
}
