// @flow
// Convenient function to create an ActionKit-ready axios instance
import axios from 'axios';
import { defaults } from 'lodash';
import { headers, body } from '../lambda-utils/responses';
import type { Axios, $AxiosXHR } from 'axios';
import type { ProxyResult } from 'flow-aws-lambda';

export type ProxyShape<T> = {
  statusCode: number,
  headers?: { [header: string]: number | string | boolean },
  body: T,
};

interface AxiosShape<T> {
  status: number;
  headers?: any;
  data: T;
}

export function resolveProxyShape<T>(
  xhr: AxiosShape<T> | Error
): Promise<ProxyShape<T>> {
  if (xhr instanceof Error) throw xhr;
  const result = {
    statusCode: xhr.status,
    headers: headers({ cors: true, headers: xhr.headers }),
    body: xhr.data,
  };
  return Promise.resolve(result);
}

export function rejectProxyShape<T>(
  xhr: AxiosShape<T> | Error
): Promise<ProxyShape<T>> {
  if (xhr instanceof Error) throw xhr;
  return Promise.reject({
    statusCode: xhr.status,
    headers: headers({ cors: true, headers: xhr.headers }),
    body: xhr.data,
  });
}
