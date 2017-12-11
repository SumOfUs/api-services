import { handler } from './subscriptions-delete';

describe('handler', () => {
  test.skip('successful request returns a 200', () => {
    const cb = jest.fn();
    const event = { pathParameters: { id: 'a1b2c3', provider: 'braintree' } };

    return handler(event, null, cb).then(() => {
      return expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: '',
        })
      );
    });
  });
});
