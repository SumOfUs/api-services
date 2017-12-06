// @flow
import { basicAuthToken } from './basicAuthToken';

test('converts a user:password combo to an Authorization compatible value', () => {
  expect(basicAuthToken('user', 'password')).toEqual(
    'Basic dXNlcjpwYXNzd29yZA=='
  );
});
