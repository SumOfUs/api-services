// @flow weak
import { show } from '../members';

test('example', () => {
  expect(1 + 1).toEqual(2);
});

describe('handler: members-show', () => {
  describe('Request Validation', () => {
    test('Invalid when {id} is undefined', () => {
      const cb = jest.fn();
      return show({}, null, cb).then(() => {
        const response = cb.mock.calls[0][1];
        expect(response.body).toEqual(
          expect.stringMatching(/"missingProperty": "id"/)
        );
      });
    });

    test('Invalid when {id} is not a numeric string', () => {
      const cb = jest.fn();
      const params = {
        pathParameters: {
          id: 'not a number',
        },
      };
      return show(params, null, cb).then(() => {
        const response = cb.mock.calls[0][1];
        expect(response.body).toEqual(
          expect.stringMatching(/properties\/id\/pattern/)
        );
        expect(response.body).toEqual(
          expect.stringMatching(/should match pattern/)
        );
      });
    });

    test('Valid when {id} is a numeric string', () => {
      const cb = jest.fn();
      const event = {
        pathParameters: {
          id: '12345678',
        },
      };
      return show(event, null, cb).then(() =>
        expect(cb).toBeCalledWith(
          null,
          expect.objectContaining({ statusCode: 200 })
        )
      );
    });
  });
});
