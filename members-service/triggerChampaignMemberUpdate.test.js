// @flow
import uuidv1 from 'uuid/v1';
import { handler } from './triggerChampaignMemberUpdate';
import { UPDATE_MEMBER_EVENT } from '../lib/dynamodb/eventTypeChecker';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { updateMember } from '../lib/clients/champaign/member';

describe('handler', function() {
  test('it is a function', () => {
    expect(typeof handler).toEqual('function');
  });

  test('does not process non-update member events', async () => {
    const cb = jest.fn();
    await handler(invalidEvent(), null, cb);
    expect(cb).toBeCalledWith(null, 'Not a member update event');
  });

  test('calls updateMember() with the member data', async () => {
    const cb = jest.fn();
    const event = validEvent();
    const update = jest.fn((...args) => updateMember(...args));
    await handler(event, null, cb, update);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'example@example.com',
        first_name: 'Example',
      })
    );
  });
});

function validEvent(date) {
  return {
    Records: [
      {
        dynamodb: {
          NewImage: Converter.marshall({
            eventName: 'INSERT',
            eventType: UPDATE_MEMBER_EVENT,
            id: uuidv1(),
            createdAt: date || new Date().toISOString(),
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
            data: {
              email: 'example@example.com',
              first_name: 'Example',
              last_name: 'User',
            },
          }),
        },
      },
    ],
  };
}

function invalidEvent(date = new Date().toISOString()) {
  return {
    Records: [
      {
        dynamodb: {
          NewImage: Converter.marshall({
            eventName: 'INSERT',
            eventType: 'INVALID_EVENT',
            id: uuidv1(),
            createdAt: date || new Date().toISOString(),
          }),
        },
      },
    ],
  };
}
