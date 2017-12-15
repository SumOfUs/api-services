export const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL';

export function cancelPaymentEvent(record = {}): boolean {
  const { eventName, eventType } = record;
  return eventName === 'INSERT' && eventType === CANCEL_PAYMENT_EVENT;
}
