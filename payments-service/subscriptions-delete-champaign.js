import axios from 'axios';
import updateOperationsLog from './updateOperationsLog';
import { cancelPaymentEvent } from '../lib/dynamodb/eventTypeChecker';
import uuid from 'uuid/v1';
import crypto from 'crypto';

export const handler = (event, context, callback) => {
  console.log('CANCEL SUBSCRIPTION EVENT: ', event);

  if (!cancelPaymentEvent(event.Records[0])) {
    return;
  }

  const record = event.Records[0].dynamodb.NewImage;

  console.log('RECORD: ', JSON.stringify(record, null, 2));

  const recurringId = record.data.M.recurringId.S;
  const provider = record.data.M.paymentProcessor.S;
  const id = record.id.S;
  const createdAt = record.createdAt.S;

  const url = `${
    process.env.CHAMPAIGN_URL
  }/api/member_services/recurring_donations/${provider}/${recurringId}`;

  const data = JSON.stringify({
    id: recurringId,
    provider: provider,
  });

  const nonce = uuid();
  const signature = crypto
    .createHmac('sha256', process.env.MEMBER_SERVICES_SECRET)
    .update(nonce)
    .digest('hex');

  axios
    .delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CHAMPAIGN-NONCE': nonce,
        'X-CHAMPAIGN-SIGNATURE': signature,
      },
    })
    .then(resp => {
      updateOperationsLog(id, createdAt, 'SUCCESS', 'champaign');
    })
    .catch(function(error) {
      updateOperationsLog(id, createdAt, 'FAILURE', 'champaign');
    });
};
