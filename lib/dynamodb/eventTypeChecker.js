export const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:DELETE';

export function cancelPaymentEvent(record = {}): boolean {
  const { eventType } = record;
  return eventType === CANCEL_PAYMENT_EVENT;
}
