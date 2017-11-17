// @flow
import { index } from '../members';

describe('members-list', () => {
  describe('Validating requests', () => {
    test('Invalid when {email} is undefined', () => {
      const cb = jest.fn();
      return index({}, null, cb).then(() => {
        const response = cb.mock.calls[0][1];
        expect(response.body).toEqual(
          expect.stringMatching(/"missingProperty": "email"/)
        );
      });
    });

    test('Invalid when {email} is not an email', () => {
      const cb = jest.fn();
      const params = {
        queryStringParameters: {
          email: 'not an email',
        },
      };
      return index(params, null, cb).then(() => {
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 400,
            body: expect.stringMatching(/(properties\/email\/format)/),
          })
        );
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            body: expect.stringMatching(/should match format/),
          })
        );
      });
    });
    test('Valid when {email} is an email', () => {
      const cb = jest.fn();
      const event = {
        queryStringParameters: {
          email: 'example@example.com',
        },
      };
      return index(event, null, cb).then(() => {
        expect(cb).toHaveBeenCalledWith(
          null,
          expect.objectContaining({ statusCode: 200 })
        );
      });
    });
  });

  describe('Searching', () => {
    const event = {
      queryStringParameters: {
        email: 'example@example.com',
        crisps: 'chips',
      },
    };
    test('Passes permitted parameters through', () => {
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(params => Promise.resolve(params));
      return index(event, null, callback, search).then(success => {
        expect(search).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'example@example.com' })
        );
      });
    });
    test('Omits unrecognised parameters', () => {
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(params => Promise.resolve(params));
      return index(event, null, callback, search).then(success => {
        expect(search).not.toHaveBeenCalledWith(
          expect.objectContaining({ crisps: 'chips' })
        );
      });
    });
  });

  describe('API Gateway Responses', () => {
    const event = {
      queryStringParameters: {
        email: 'example@example.com',
      },
    };
    test('Returns 200 OK when when successful', () => {
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(params => Promise.resolve(params));
      return index(event, null, callback, search).then(({ error, data }) => {
        expect(error).toBeNull();
        expect(data).toEqual(
          expect.objectContaining({
            statusCode: 200,
            body: expect.stringMatching(/"email": "example@example.com"/),
          })
        );
      });
    });

    test('Passes through HTTP errors', () => {
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(params =>
        Promise.reject({
          statusCode: 400,
          body: 'There was an issue with your request',
        })
      );
      return index(event, null, callback, search).then(() => {
        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            statusCode: 400,
            body: 'There was an issue with your request',
          })
        );
      });
    });

    test('Throws unknown errors, to trigger an Internal Server Error', () => {
      const error = new Error('An error');
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(() => Promise.reject(error));
      return expect(index(event, null, callback, search)).rejects.toBe(error);
    });
  });
});
