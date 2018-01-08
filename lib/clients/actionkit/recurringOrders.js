// @flow weak
import { AKClient } from './resources/client';

export function cancel(recurringId, client = AKClient) {
  return client.post('/profilecancelpush/', {
    recurring_id: recurringId,
    canceled_by: 'admin',
  });
}
