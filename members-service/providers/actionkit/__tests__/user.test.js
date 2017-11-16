// @flow
import { searchUser } from '../user';
import { pick } from 'lodash';

const env = pick(process.env, 'AK_API_URL', 'AK_PASSWORD', 'AK_USERNAME');

describe('searchUser', () => {
  test('returns an array of matches', () => {
    const params = { email: 'example@example.com' };
    return searchUser(params, env).then(result =>
      expect(result).toMatchSnapshot()
    );
  });

  test('returns an empty array if there are no matches', () => {
    const params = { email: 'nonexistentuser@example.com' };
    return searchUser(params, env).then(result =>
      expect(result).toMatchSnapshot()
    );
  });

  test('passes through the error responses, rejecting the promise', () => {
    return expect(
      searchUser({ email__startswith: true })
    ).rejects.toMatchSnapshot();
  });

  test('rejects with an error message if AK_API_URL is not set', () => {
    return expect(
      searchUser(null, { ...env, AK_API_URL: '' })
    ).rejects.toMatchSnapshot();
  });

  test('rejects with an error message if AK_USERNAME is not set', () => {
    return expect(
      searchUser(null, { ...env, AK_USERNAME: '' })
    ).rejects.toMatchSnapshot();
  });

  test('rejects with an error message if AK_PASSWORD is not set', () => {
    return expect(
      searchUser(null, { ...env, AK_PASSWORD: '' })
    ).rejects.toMatchSnapshot();
  });
});

// Mock AK API requests.
// To make real requests (and update snapshots), comment the following lines:
jest.mock('axios-es6', () => ({
  get(query, options) {
    if (options.params.email) {
      return Promise.resolve(
        require('../__tapes__/searchUser')[options.params.email]
      );
    }

    if (options.params.email__startswith) {
      const error = require('../__tapes__/searchUser')['email__startswith'];
      return Promise.reject(error);
    }

    return Promise.reject(new Error('connect ECONNREFUSED 127.0.0.1:80'));
  },
}));
