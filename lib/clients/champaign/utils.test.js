// @flow weak
import { integrationHeaders } from './utils';
describe('integrationHeaders', function() {
  test('throws when no secret is present', () => {
    expect(() => integrationHeaders('')).toThrowError(
      `Can't create a signature header without a secret`
    );
  });
});
