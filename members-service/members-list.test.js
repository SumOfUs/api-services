// @flow
import { indexHandler as index } from './members';

const { stringMatching, objectContaining, arrayContaining } = expect;

describe('members-list', () => {
  describe('Validating requests', () => {
    test('Invalid when {email} is undefined', () => {
      const cb = jest.fn();
      return index({}, null, cb).then(() => {
        const response = cb.mock.calls[0][1];
        expect(response.body).toEqual(
          stringMatching(/"missingProperty": "email"/)
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
          objectContaining({
            statusCode: 400,
            body: stringMatching(/(properties\/email\/format)/),
          })
        );
        expect(cb).toBeCalledWith(
          null,
          objectContaining({
            body: stringMatching(/should match format/),
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
          objectContaining({ statusCode: 200 })
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
      return index(event, null, callback).then(
        success => {
          const { body } = callback.mock.calls[0][1];
          expect(JSON.parse(body)).toEqual(
            objectContaining({
              objects: arrayContaining([
                objectContaining({ email: 'example@example.com' }),
              ]),
            })
          );
        },
        error => {
          console.log('error');
        }
      );
    });
    test('Omits unrecognised parameters', () => {
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(params => Promise.resolve(params));
      return index(event, null, callback).then(success => {
        expect(search).not.toHaveBeenCalledWith(
          objectContaining({ crisps: 'chips' })
        );
      });
    });
  });

  describe('API Gateway Responses', () => {
    test('Returns 200 OK when when successful', () => {
      const event = {
        queryStringParameters: {
          email: 'example@example.com',
        },
      };
      const callback = jest.fn((error, data) => ({ error, data }));
      return index(event, null, callback).then(({ error, data }) => {
        expect(error).toBeNull();
        expect(data).toEqual(
          objectContaining({
            statusCode: 200,
            body: stringMatching(/"email": "example@example.com"/),
          })
        );
      });
    });

    test('on rejection, it calls the callback with the error', () => {
      const event = {
        queryStringParameters: {
          email: `non.existent.user@example.com`,
        },
      };
      const callback = jest.fn((error, data) => ({ error, data }));
      const search = jest.fn(() => Promise.reject({ statusCode: 404 }));
      index(event, null, callback, search).then(({ error, data }) => {
        expect(data).toEqual(objectContaining({ statusCode: 404 }));
      });
    });
  });
});
