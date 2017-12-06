// @flow
import axios from 'axios';
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import { basicAuthToken } from '../../util/basicAuthToken';
import type { ProxyShape } from '../helpers';
import type { Axios, AxiosPromise } from 'axios';
import type { User, IUserUpdate, UserCollection } from '../actionkit.types.js';

const client = axios.create({
  baseURL: process.env.AK_API_URL || '',
  headers: {
    authorization: basicAuthToken(
      process.env.AK_USERNAME || '',
      process.env.AK_PASSWORD || ''
    ),
  },
});

export type SearchResult = Promise<ProxyShape<User[]>>;
export type SearchFilters = { [key: string]: string | number | boolean };
export function search(f: ?SearchFilters, config: any = {}) {
  return client
    .get(`/user`, {
      params: f || {},
    })
    .then(resolveProxyShape, rejectProxyShape);
}

export function find(id: string, config: any = {}) {
  return client
    .get(`/user/${id}`, {
      ...config,
    })
    .then(resolveProxyShape, rejectProxyShape);
}

export function update(id: string, data: IUserUpdate, config: any = {}) {
  return client
    .patch(`/user/${id}/`, data)
    .then(resolveProxyShape, rejectProxyShape);
}
