// @flow weak
import { show } from '../braintree_data';

describe('handler: braintree-data.show', () => {
  test('if email param is blank it returns 400 bad request', () => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
    };

    show(params, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 400,
          body: expect.stringMatching(/should have required property 'email'/),
        })
      );
    }, null);
  });

  test('if email param is present it returns 200 ok', () => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
      queryStringParameters: { email: 'example@example.com' },
    };

    return show(params, null, cb).then(() => {
      return expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: expect.stringMatching(/"email": "example@example.com"/),
        })
      );
    });
  });
});
