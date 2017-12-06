const CANCEL_PAYMENT_EVENT = 'PAYMENT_SERVICE:SUBSCRIPTION:CANCEL';

export function cancelPaymentEvent(record): boolean {
  if (record.eventName !== 'INSERT') return false;
  if (record.dynamodb.NewImage.eventType.S !== CANCEL_PAYMENT_EVENT)
    return false;

  return true;
}
