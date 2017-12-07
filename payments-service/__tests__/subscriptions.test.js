import { handler } from '../subscriptions-delete';

describe('handler', () => {
  test('successful request returns a 200', () => {
    const cb = jest.fn();
    const event = { pathParameters: { id: 'a1b2c3', provider: 'braintree' } };

    handler(event, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: '',
        })
      );
    });
  });
});
