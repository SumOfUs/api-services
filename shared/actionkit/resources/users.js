// @flow
import axios from 'axios';
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import type { ProxyShape } from '../helpers';
import type { Axios, AxiosPromise } from 'axios';
import type { User, IUserUpdate, UserCollection } from '../actionkit.types.js';

const CONFIG = {
  baseUrl: process.env.AK_API_URL,
  auth: {
    username: process.env.AK_USERNAME,
    password: process.env.AK_PASSWORD,
  },
};
export type SearchResult = Promise<ProxyShape<User[]>>;
export type SearchFilters = { [key: string]: string | number | boolean };
export function search(f: ?SearchFilters, config: any = CONFIG) {
  return axios
    .get(`${config.baseUrl}/user`, {
      ...config,
      params: f || {},
    })
    .then(resolveProxyShape, rejectProxyShape);
}

export function find(id: string, config: any = CONFIG) {
  return axios
    .get(`${config.baseUrl}/user/${id}`)
    .then(resolveProxyShape, rejectProxyShape);
}

export function update(id: string, data: IUserUpdate, config: any = CONFIG) {
  return axios
    .put(`${config.baseUrl}/user/${id}`, data)
    .then(resolveProxyShape, rejectProxyShape);
}
