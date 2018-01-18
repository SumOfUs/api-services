// @flow
import { handlerFunc as handler } from './updateMember';

describe('updateMember handler', function() {
  test('if email param is blank it returns 400 bad request', () => {
    const cb = jest.fn();
    const params = {
      pathParameters: 'abc',
    };

    handler(params, null, cb)
      .then(() => {
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({
            statusCode: 400,
            body: expect.stringMatching(
              /should have required property 'email'/
            ),
          })
        );
      })
      .catch(error => {
        throw error;
      });
  });
});
