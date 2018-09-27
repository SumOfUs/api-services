export const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:DELETE';
export const UPDATE_MEMBER_EVENT = 'MEMBERS_SERVICE:MEMBER:UPDATE';
export const SUBJECT_ACCESS_REQUEST_EVENT =
  'MEMBERS_SERVICE:MEMBER:SUBJECT_ACCESS_REQUEST';

export function updateMemberEvent(eventName, record = {}): boolean {
  return eventName === 'INSERT' && record.eventType === UPDATE_MEMBER_EVENT;
}
export function cancelPaymentEvent(eventName, record = {}): boolean {
  return eventName === 'INSERT' && record.eventType === CANCEL_PAYMENT_EVENT;
}
export function subjectAccessRequestEvent(eventName, record = {}): boolean {
  return (
    (eventName === 'INSERT' || 'UPDATE') &&
    record.eventType === SUBJECT_ACCESS_REQUEST_EVENT
  );
}
