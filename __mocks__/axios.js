// @flow
import type { AxiosXHRConfig, AxiosPromise } from 'axios';

export const get = (
  url: string,
  options: AxiosXHRConfig<*>
): AxiosPromise<*> => {
  if (url.match(/user$/) && options.params) {
    if (options.params.email) {
      const email = options.params.email;
      const result = require('./__tapes__/user')[email];
      return Promise.resolve(result);
    }

    if (options.params.email__startswith) {
      const error = require('./__tapes__/user')['email__startswith'];
      return Promise.reject(error);
    }
  }

  return Promise.reject(new Error('connect ECONNREFUSED 127.0.0.1:80'));
};
