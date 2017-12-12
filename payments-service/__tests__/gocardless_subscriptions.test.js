import { index } from '../gocardless_subscriptions';

describe('handler: gocardless_subscriptions.index', () => {
  test('it returns a list of GC subscriptions', done => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
      pathParameters: { memberId: '12358102' },
    };

    index(params, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: expect.stringMatching(/"id": "SB00002WF7DNMC"/),
        })
      );
      done();
    });
  });

  test('it returns an empty list if no subscriptions are found', done => {
    const cb = jest.fn();
    const params = {
      httpMethod: 'GET',
      pathParameters: { memberId: '4666356' },
    };

    index(params, null, cb).then(() => {
      expect(cb).toBeCalledWith(
        null,
        expect.objectContaining({
          statusCode: 200,
          body: '[]',
        })
      );
      done();
    });
  });
});
