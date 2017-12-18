// @flow
import type { ProxyResult } from 'flow-aws-lambda';

// Generic parameters interface for all response helpers.
// All response should receive an options parameter where we
// can set a status code, cors, response heaers, and the response body
type ResponseOptions = {
  statusCode?: number,
  cors?: boolean,
  headers?: $PropertyType<ProxyResult, 'headers'>,
  body?: any,
};

// Helpers

export function response(options?: ResponseOptions = {}): ProxyResult {
  return {
    statusCode: options.statusCode || 200,
    headers: headers(options),
    body: body(options.body),
  };
}

export function body(content: any = ''): string {
  if (content == null) return '';
  if (content instanceof Error) content = content.message;
  if (typeof content === 'string') return content;
  return JSON.stringify(content, null, 2);
}

export function headers(
  options?: ResponseOptions = {}
): $PropertyType<ProxyResult, 'headers'> {
  const headers = options.headers || {};
  if (options.cors) {
    return {
      ...headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
  }
  return headers;
}

// 2xx SUCCESS statuses

export function ok(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 200 });
}

// export function created(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 201 });
// }

// export function accepted(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 202 });
// }

// export function noContent(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 204 });
// }

// 4xx CLIENT ERROR statuses
export function badRequest(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 400 });
}

// export function unauthorized(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 401 });
// }

// export function forbidden(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 403, body: '' });
// }

export function notFound(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 404, body: '' });
}

// export function timeout(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 408 });
// }

// 5xx Server Error responses
// export function serverError(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 500 });
// }

// export function notImplemented(options?: ResponseOptions = {}): ProxyResult {
//   return response({ ...options, statusCode: 501, body: '' });
// }

// Head only response
// export function head(options?: ResponseOptions = {}): ProxyResult {
//   return response({
//     ...options,
//     statusCode: options.statusCode || 200,
//     body: '',
//   });
// }
