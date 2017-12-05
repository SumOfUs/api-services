// @flow
import { resolveProxyShape, rejectProxyShape } from '../helpers';
import type { AxiosError } from '../helpers';
import { search } from '../resources/users';
import axios from 'axios';

describe('resolveProxyShape', () => {
  const axiosShape = {
    status: 200,
    statusText: 'OK',
    headers: {
      'x-test-header': 'test',
    },
    data: 'TEST',
  };
  test('converts an axios shape to a proxy compatible shape', () => {
    const proxyShape = resolveProxyShape(axiosShape);
    expect(proxyShape).resolves.toEqual(
      expect.objectContaining({
        statusCode: 200,
        headers: expect.objectContaining({
          'x-test-header': 'test',
        }),
        body: 'TEST',
      })
    );
  });

  test('throws an error if the response is an error', () => {
    expect(() => resolveProxyShape(new Error('Test error'))).toThrow(
      'Test error'
    );
  });
});

describe('rejectProxyShape', () => {
  const error: AxiosError = new Error('Testing error');
  test('throws when it is passed a generic Error', () => {
    expect(() => rejectProxyShape(error)).toThrow(/Testing error/);
  });

  test('rejects with a ProxyShape object', () => {
    expect(
      rejectProxyShape({ response: { status: 404, data: null } })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
