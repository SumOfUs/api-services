// @flow
import { AKClient as client } from './client';
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import type { ProxyShape } from '../helpers';
import type { Axios, AxiosPromise } from 'axios';
import type { User, IUserUpdate, UserCollection } from '../actionkit.types.js';

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
