// @flow
import { show } from '../members';

jest.mock('axios');

describe('handler: members-show', () => {
  describe('Request Validation', () => {
    test('Invalid when {id} is undefined', () => {
      const cb = jest.fn();
      return show({}, null, cb).then(() => {
        const response = cb.mock.calls[0][1];
        expect(response.body).toEqual(
          expect.stringMatching(/"missingProperty": "id"/)
        );
      });
    });

    test('Invalid when {id} is not a numeric string', () => {
      const cb = jest.fn();
      const params = { pathParameters: { id: 'not a number' } };
      return show(params, null, cb).then(() => {
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 400,
            body: expect.stringMatching(/(properties\/id\/pattern)/),
          })
        );
      });
    });
  });

  describe('Responses', () => {
    test('calls the callback on success', () => {
      const cb = jest.fn();
      const event = { pathParameters: { id: '388175' } };
      return show(event, null, cb).then(() => {
        return expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 200,
            body: expect.stringMatching('"id": 388'),
          })
        );
      });
    });

    test('calls the callback on failure if it is a 400 error', () => {
      const cb = jest.fn();
      const find = jest.fn(() => Promise.reject({ statusCode: 401 }));
      const event = { pathParameters: { id: '000000' } };
      return show(event, null, cb, find).then(() => {
        return expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 401,
          })
        );
      });
    });

    test('raises an exception on other errors', () => {
      const cb = jest.fn();
      const find = jest.fn(() => {
        throw new Error('Testing error');
      });
      const event = { pathParameters: { id: '12345' } };
      return show(event, null, cb, find).catch(exception =>
        expect(exception).toEqual(new Error('Testing error'))
      );
    });
  });
});
