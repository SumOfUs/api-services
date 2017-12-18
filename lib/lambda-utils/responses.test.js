// @flow
import { body, badRequest, headers, ok, response } from './responses';

describe('badRequest(...)', () => {
  test('always returns a statusCode 400', () => {
    expect(badRequest()).toEqual(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });
});

describe('body(...)', () => {
  test('always returns a string', () => {
    expect(body(null)).toEqual('');
  });
});

describe('headers(...)', () => {
  test('has default headers', () => {
    expect(headers()).toEqual({});
  });

  test('returns CORS headers if options.cors = true', () => {
    expect(headers({ cors: true })).toEqual(
      expect.objectContaining({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      })
    );
  });
});

describe('ok(...)', () => {
  test('always returns a 200 statusCode', () => {
    expect(ok({ statusCode: 300 }).statusCode).toEqual(200);
  });

  test('works without parameters', () => {
    expect(() => ok()).not.toThrow();
  });

  test('returns the error message if passed an error', () => {
    expect(body(new Error('hello'))).toEqual('hello');
  });

  test('returns the string if passed one', () => {
    const str = 'hello';
    expect(body(str)).toBe(str);
  });

  test('returns a JSON.stringified object if passed one', () => {
    const obj = { hello: 'world' };
    expect(body(obj)).toEqual(JSON.stringify(obj, null, 2));
  });
});

describe('response(...)', () => {
  test('statusCode defaults to 200 OK', () => {
    expect(response().statusCode).toEqual(200);
  });
});
