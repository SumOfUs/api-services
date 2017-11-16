// @flow
import { index } from '../members';
jest.mock('../providers/actionkit/user', () => ({
  searchUser: () => Promise.resolve(),
}));

describe('members-list validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
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
    return index(event, null, cb).then(() => expect(cb).toBeCalled());
  });
});
