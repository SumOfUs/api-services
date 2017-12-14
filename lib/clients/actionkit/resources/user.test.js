// @flow
import { search } from './users';
import { pick } from 'lodash';

const { arrayContaining, objectContaining } = expect;

describe('search', () => {
  test('returns an array of matches', () => {
    const params = { email: 'example@example.com' };
    return search(params).then(result => {
      expect(result.body.objects).toEqual(
        arrayContaining([objectContaining(params)])
      );
    });
  });

  test('returns an empty array if there are no matches', () => {
    const params = { email: 'nonexistentuser@example.com' };
    return search(params).then(result =>
      expect(result.body.objects).toHaveLength(0)
    );
  });

  test('passes through the error responses, rejecting the promise', () => {
    return expect(search({ email__startswith: true })).rejects.toEqual(
      objectContaining({
        statusCode: 400,
        body: {
          error: "'startswith' is not an allowed filter on the 'email' field.",
        },
      })
    );
  });
});
