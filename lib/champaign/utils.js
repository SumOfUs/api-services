// @flow
import uuidv4 from 'uuid/v4';
import crypto from 'crypto';

export function integrationHeaders(secret?: string) {
  if (!secret) {
    throw new Error(`Can't create a signature header without a secret`);
  }

  const nonce = uuidv4();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(nonce)
    .digest('hex');

  return {
    'x-champaign-nonce': nonce,
    'x-champaign-signature': signature,
  };
}
