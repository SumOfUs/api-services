// @flow
import { updateMember } from './member';

const { objectContaining } = expect;

test('populates the request with integration headers', () => {
  return updateMember({
    email: 'vincent@sumofus.org',
    first_name: 'Example',
    last_name: 'Member',
    postal: '1000',
    country: 'US',
  }).then(response => {
    console.log(`headers`, response.config.headers);
    expect(response.config.headers).toEqual(
      objectContaining({
        'x-champaign-nonce': 'c3de0ba2-53d2-433b-89d2-62668b013f6a',
      })
    );
  });
});
