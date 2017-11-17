// @flow
import axios from 'axios';
import { pick } from 'lodash';
import type { AxiosPromise } from 'axios';
import type { AKListResponse, User } from './actionkit.types';

// Accessing process.env is expensive, therefore we make
// a local copy of what we need
type Env = {
  AK_API_URL?: string,
  AK_USERNAME?: string,
  AK_PASSWORD?: string,
};
const environment: Env = pick(
  process.env,
  'AK_API_URL',
  'AK_PASSWORD',
  'AK_USERNAME'
);
type SearchResponse = AKListResponse<User[]>;
export function search(
  filters: any,
  env: Env = environment
): AxiosPromise<SearchResponse> {
  if (!env.AK_API_URL) return Promise.reject('AK_API_URL is not set');
  if (!env.AK_USERNAME || !env.AK_PASSWORD) {
    return Promise.reject('ActionKit credentials are not set');
  }
  return axios.get(`${env.AK_API_URL}/user`, {
    auth: {
      username: env.AK_USERNAME,
      password: env.AK_PASSWORD,
    },
    params: { ...filters, limit: 1 },
  });
}

export function searchUser(
  filters: any,
  env: Env = environment
): Promise<User[]> {
  return search(filters, env)
    .then(result => result.data.objects)
    .catch(error => {
      if (error.status) {
        return Promise.reject({
          statusCode: error.status,
          body: error.data,
        });
      }
      return Promise.reject(error);
    });
}
