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
    expect(response.config.headers).toHaveProperty('x-champaign-nonce');
    expect(response.config.headers).toHaveProperty('x-champaign-signature');
  });
});
