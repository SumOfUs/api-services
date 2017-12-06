// @flow
import axios from 'axios';
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import type { ProxyShape } from '../helpers';
import type { Axios, AxiosPromise } from 'axios';
import type { User, IUserUpdate, UserCollection } from '../actionkit.types.js';

const CONFIG = {
  baseURL: process.env.AK_API_URL || '',
  headers: {
    authorization: `Basic ${token(
      process.env.AK_USERNAME || '',
      process.env.AK_PASSWORD || ''
    )}`,
  },
};

const client = axios.create(CONFIG);

export function token(user: string, password: string): string {
  return new Buffer(`${user || ''}:${password || ''}`).toString('base64');
}

export type SearchResult = Promise<ProxyShape<User[]>>;
export type SearchFilters = { [key: string]: string | number | boolean };
export function search(f: ?SearchFilters, config: any = CONFIG) {
  return client
    .get(`/user`, {
      params: f || {},
    })
    .then(resolveProxyShape, rejectProxyShape);
}

export function find(id: string, config: any = CONFIG) {
  return client
    .get(`/user/${id}`, {
      ...config,
    })
    .then(resolveProxyShape, rejectProxyShape);
}

export function update(id: string, data: IUserUpdate, config: any = CONFIG) {
  return client
    .patch(`/user/${id}/`, data)
    .then(resolveProxyShape, rejectProxyShape);
}
