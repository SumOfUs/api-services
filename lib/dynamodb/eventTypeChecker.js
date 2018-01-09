export const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:DELETE';
export const UPDATE_MEMBER_EVENT = 'MEMBERS_SERVICE:MEMBER:UPDATE';

export function updateMemberEvent(eventName, record = {}): boolean {
  return eventName === 'INSERT' && record.eventType === UPDATE_MEMBER_EVENT;
}
export function cancelPaymentEvent(eventName, record = {}): boolean {
  return eventName === 'INSERT' && record.eventType === CANCEL_PAYMENT_EVENT;
}
