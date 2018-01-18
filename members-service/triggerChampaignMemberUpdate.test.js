// @flow
import uuidv1 from 'uuid/v1';
import { handlerFunc as handler } from './triggerChampaignMemberUpdate';
import { UPDATE_MEMBER_EVENT } from '../lib/dynamodb/eventTypeChecker';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { updateMember } from '../lib/clients/champaign/member';

jest.mock('../lib/dynamodb/operationsLogger');

jest.spyOn(console, 'error');

describe('handler', function() {
  test('it is a function', () => {
    expect(typeof handler).toEqual('function');
  });

  test('does not process non-update member events', async () => {
    const cb = jest.fn();
    handler(invalidEvent(), null, cb);
    return expect(console.error).toBeCalledWith(
      'ERROR: Not a member update event'
    );
  });

  test('calls updateMember() with the member data', async () => {
    const event = validEvent();
    const update = jest.fn();
    handler(event, null, jest.fn(), update);
    return expect(update).toHaveBeenCalledWith('vincent@sumofus.org', {
      first_name: 'Vince',
      last_name: 'Martinez',
    });
  });
});

function validEvent(date) {
  return {
    Records: [
      {
        eventName: 'INSERT',
        dynamodb: {
          NewImage: Converter.marshall({
            eventType: UPDATE_MEMBER_EVENT,
            id: uuidv1(),
            createdAt: date || new Date().toISOString(),
            status: { actionkit: 'PENDING', champaign: 'PENDING' },
            data: {
              email: 'vincent@sumofus.org',
              params: {
                first_name: 'Vince',
                last_name: 'Martinez',
              },
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
        eventName: 'INSERT',
        dynamodb: {
          NewImage: Converter.marshall({
            eventType: 'INVALID_EVENT',
            id: uuidv1(),
            createdAt: date || new Date().toISOString(),
          }),
        },
      },
    ],
  };
}
