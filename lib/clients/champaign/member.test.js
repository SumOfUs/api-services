// @flow weak
import { updateMember } from './member';

test('populates the request with integration headers', done => {
  return updateMember('vincent@sumofus.org', {
    first_name: 'Example',
    last_name: 'Member',
    postal: '1000',
    country: 'US',
  })
    .then(response => {
      expect(response.config.headers).toHaveProperty('x-champaign-nonce');
      expect(response.config.headers).toHaveProperty('x-champaign-signature');
      done();
    })
    .catch(error => {
      throw error;
    });
});
