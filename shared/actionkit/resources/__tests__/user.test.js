// @flow
import { search } from '../users';
import { pick } from 'lodash';

jest.mock('axios');
describe('search', () => {
  test('returns an array of matches', () => {
    const params = { email: 'example@example.com' };
    return search(params).then(result => expect(result).toMatchSnapshot());
  });

  test('returns an empty array if there are no matches', () => {
    const params = { email: 'nonexistentuser@example.com' };
    return search(params).then(result => expect(result).toMatchSnapshot());
  });

  test('passes through the error responses, rejecting the promise', () => {
    return expect(
      search({ email__startswith: true })
    ).rejects.toMatchSnapshot();
  });

  test('fails gracefully on network errors', () => {
    return expect(search()).rejects.toMatchSnapshot();
  });
});
