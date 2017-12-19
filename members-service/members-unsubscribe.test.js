// @flow
import { unsubscribe, unsubscribe_page } from './members';

describe('members-unsubscribe', () => {
  describe('with a valid email address', () => {
    describe('success', () => {
      test('It sends an AK action to the unsubscribe page', () => {
        const event = { body: '{"email":"tuuli@sumofus.org"}' };
      });
      test('It writes to the operations log table', () => {});
    });

    describe('failure', () => {
      test('It fails if unsubscribe page check fails.', () => {
        const cb = jest.fn();
        const event = { body: '{"email":"tuuli@sumofus.org"}' };
        const page_check = jest.fn(() => {
          return Promise.reject(new Error('Unsubscribe page needs to be set.'));
        });
        return unsubscribe(event, null, cb, page_check).then(() => {
          const response = cb.mock.calls[0][1];
          expect(response.body).toEqual(
            expect.stringMatching('Unsubscribe page needs to be set.')
          );
        });
      });

      describe('Invalid requests', () => {
        test('Invalid when email is undefined', () => {
          const cb = jest.fn();
          const event = { body: '{}' };
          return unsubscribe(event, null, cb).then(() => {
            const response = cb.mock.calls[0][1];
            expect(response.body).toEqual(
              expect.stringMatching(/"missingProperty": "email"/)
            );
          });
        });

        test('Invalid when email is not an email', () => {
          const cb = jest.fn();
          const event = { body: '{"email":"asd"}' };
          return unsubscribe(event, null, cb).then(() => {
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
      });
    });
  });
});
