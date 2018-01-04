export const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL';
export const UPDATE_MEMBER_EVENT = 'MEMBERS_SERVICE:MEMBER:UPDATE';

export function updateMemberEvent(record = {}): boolean {
  const { eventName, eventType } = record;
  return eventName === 'INSERT' && eventType === UPDATE_MEMBER_EVENT;
}
export function cancelPaymentEvent(record = {}): boolean {
  const { eventName, eventType } = record;
  return eventName === 'INSERT' && eventType === CANCEL_PAYMENT_EVENT;
}
