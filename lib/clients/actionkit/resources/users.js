// @flow
import { AKClient as client } from './client';
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import type { ProxyShape } from '../helpers';
import type { Axios, AxiosPromise } from 'axios';
import type { User, IUserUpdate, UserCollection } from '../actionkit.types.js';

export type SearchResult = Promise<ProxyShape<User[]>>;
export type SearchFilters = { [key: string]: string | number | boolean };

export function search(f: ?SearchFilters = {}) {
  return client
    .get(`/user/`, { params: f })
    .then(resolveProxyShape, rejectProxyShape);
}

export function find(id: string) {
  return client
    .get(`/user/${id}/`)
    .then(resolveProxyShape, rejectProxyShape)
    .then(response => {
      if (!response.body) {
        return Promise.reject({ ...response, statusCode: 404 });
      }
      return response;
    });
}

export function update(id: string, data: IUserUpdate, config: any = {}) {
  return client
    .patch(`/user/${id}/`, data)
    .then(resolveProxyShape, rejectProxyShape);
}

export function unsubscribe(
  email: string,
  page: ?string = process.env.UNSUBSCRIBE_PAGE_NAME
) {
  if (!page) {
    throw new Error('Unsubscribe page needs to be set.');
  }
  return client
    .post('/action/', { page, email })
    .then(resolveProxyShape, rejectProxyShape);
}
