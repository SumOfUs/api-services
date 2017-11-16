// @flow
import { show } from '../members';

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
      const params = {
        pathParameters: {
          id: 'not a number',
        },
      };
      return show(params, null, cb).then(() => {
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 400,
            body: expect.stringMatching(/(properties\/id\/pattern)/),
          })
        );
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            body: expect.stringMatching(/should match pattern/),
          })
        );
      });
    });

    test('Valid when {id} is a numeric string', () => {
      const cb = jest.fn();
      const event = {
        pathParameters: {
          id: '12345678',
        },
      };
      return show(event, null, cb).then(() =>
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 200,
            body: expect.stringMatching(/Go Serverless Webpack/),
          })
        )
      );
    });
  });
});
