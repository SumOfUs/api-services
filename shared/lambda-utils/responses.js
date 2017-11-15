// @flow

// AWS ProxyResult
// This is the object shape that Lambdas with the API_PROXY
// integration expect
type ProxyResult = {
  statusCode: number,
  headers?: {
    [header: string]: boolean | number | string,
  },
  body: string,
  isBase64Encoded?: boolean,
};

// Generic parameters interface for all response helpers.
// All response should receive an options parameter where we
// can set a status code, cors, response heaers, and the response body
type ResponseOptions = {
  statusCode?: number,
  cors?: boolean,
  headers?: $PropertyType<ProxyResult, 'headers'>,
  body?: JSONValue | JSONValue[] | string,
};

// Instead of using Object (which accepts functions), this mimicks a
// JSON type of object.
// Note: Never send an object with circular dependencies as the body
// to any of the response helpers, as it will break when we pass it
// to JSON.stringify, causing a 500 Internal Server error response.
type JSONValue = {
  [key: string]: string | number | JSONValue,
};

// 2xx SUCCESS statuses

export function ok(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 200 });
}

export function created(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 201 });
}

export function accepted(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 202 });
}

export function noContent(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 204 });
}

// 4xx CLIENT ERROR statuses

export function badRequest(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 400 });
}

export function unauthorized(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 401 });
}

export function forbidden(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 403, body: '' });
}

export function notFound(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 404, body: '' });
}

export function timeout(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 408 });
}

// 5xx Server Error responses
export function notImplemented(options?: ResponseOptions = {}): ProxyResult {
  return response({ ...options, statusCode: 501, body: '' });
}

// Head only response
export function head(options?: ResponseOptions = {}): ProxyResult {
  return response({
    ...options,
    statusCode: options.statusCode || 200,
    body: '',
  });
}

// Generic helpers

export function response(options?: ResponseOptions = {}): ProxyResult {
  return {
    statusCode: options.statusCode || 200,
    headers: headers(options),
    body: body(options.body),
  };
}

function body(content?: $PropertyType<ResponseOptions, 'body'>): string {
  if (!content) return '';
  return typeof content !== 'string'
    ? JSON.stringify(content, null, 2)
    : content;
}

function headers(
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
